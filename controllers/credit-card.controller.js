/*****************************************************************************
 * 
 * Importación de paquetes
 * 
 */
const logger = require('log4js').getLogger('credit-card');
const { response } = require( 'express' );
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
moment.locale( 'es' );                            // Declaro que idioma va a ser Español

/*****************************************************************************
  * 
  * Modelos
  * 
  */
 
const CreditCard = require( '../models/credit-card.model' );
const { findByIdAndDelete } = require('../models/credit-card.model');
 
/*****************************************************************************
 * 
 * Helpers
 * 
 */
 
 
 /*****************************************************************************
  * 
  * Controladores
  * 
  */
 
const crear = async ( req, res ) => {
const body = req.body;

const _id = req._id;
const fecha = moment( req.body.date, 'DD/MM/YYYY').format( 'DD/MM/YYYY' );

// Valido mediante expreción regular si la fecha ingresada es correcta
const validarFecha = /([0-2][0-9]|3[0-1])(\/)(0[1-9]|1[0-2])(\/)(\d{4})/i;

logger.debug( `Validando fecha ${ req.body.date }`);
if( !validarFecha.test( fecha ) ){
  logger.warn( `Formato invalido de FECHA, debe ser DD/MM/YYYY: ${ req.body.date }`)
  return res.status( 404 ).json({
    ok: false,
    msg: 'Formato invalido de FECHA, debe ser DD/MM/YYYY'
  });
}

const cuotas = [];
/****************************************************************
 *  Parametros para completar los datos automaticamente de la 
 * compra con la tarjeta de credioto
 ****************************************************************/
// Saco de la fecha de compra el mes
const mes = req.body.date.slice( -7 );
// Valor cuota
const monto_cuota = body.amount / body.cuots;
// Registro unico para el manejo masibo de cuotas
const registry = uuidv4();

for (let cuots = 1; cuots <= body.cuots; cuots++) {
  
  // Mes/año en donde comienza y finalizan las cutas
  const futureMonth = moment( mes, 'MM/YYYY' ).add( cuots, 'M').format( 'MM/YYYY' );

  const cuota = new CreditCard ({
    ...body,
    month: futureMonth,
    amount_cuots: monto_cuota,
    installments_of: cuots,
    registry,
    idUser: _id
  });
    
  try {
    await cuota.save();
    cuotas.push( cuota );
    logger.debug( `Guardando cuota ${ cuots } de ${ body.cuots } para el registro ${ registry }` );
    
  } catch (error) {
    logger.error( `crear - ${ error }`);
    res.status( 500 ).json({
      ok: false
    });
  }
  
  
  
}

res.json({
  ok: true,
  buys: cuotas
});


}
 
const listar = async ( req, res ) => {

  const mes = req.query.mes || ("0" + (new Date().getMonth() + 1)).slice(-2) + '/' + (new Date().getFullYear() );

  try {
    
    logger.debug( `Buscando gastos para el mes de ${ mes }`);
    const gastosMensuales = await CreditCard.find( { month: mes } );
    
    if( gastosMensuales.length === 0 ){
      logger.warn( `No se encontraron gastos para el mes ${ mes }` )
      return res.status( 404 ).json({
        ok: false,
        msg: `No se encontraron gastos para el mes ${ mes }`
      });
    }

    // calculo el gasto mensual
    logger.debug( 'Calculando la suma de los gastos del mes');
    let total = 0;
    gastosMensuales.forEach( suma => {
      total += suma.amount_cuots;
    });
    
    res.json({
      ok:true,
      total,
      purchases: gastosMensuales
    });

  } catch (error) {
    logger.error( `listar - ${ error }` );
    res.status(500).json({
      ok:true,
      msg: 'Error desconocido comuniquese con el adminstrador'
    });
  }

}

const eliminar = async ( req, res = response ) => {

  const _id = req._id;
  const registry = req.params.registry;

  try {
      logger.debug( `Validando si el registro ${ registry } pertenece al usuario ${ _id }` );
      const resultados = await CreditCard.find( { registry, "idUser": _id } );

      if( resultados.length === 0 ){
        logger.warn( `No existen el registros ${ registry } para el usuario ${ _id }`);
        return res.status( 400 ).json({
          ok:false,
          msg: `No existen el registros ${ registry } para el usuario`
        });
      }


      for( const registro of resultados ){
        logger.debug( `Eliminando registro ${ registry } con ID ${ registro._id }` );
        await CreditCard.findByIdAndDelete( registro._id );
      };

      res.json({
        ok: true,
        eliminated: resultados
      });
    
  } catch (error) {
    logger.error( ` eliminar - ${ error }`);
  }

}
 
/*****************************************************************************
 * 
 * Exportación de controlladores
 * 
 */

module.exports = {
  crear,
  listar,
  eliminar
}
 
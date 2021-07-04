/*****************************************************************************
 * 
 * Importación de paquetes
 * 
 */
const logger = require('log4js').getLogger('buy');
const { response } = require( 'express' );
const moment = require('moment');
moment.locale( 'es' );                            // Declaro que idioma va a ser Español

/*****************************************************************************
 * 
 * Modelos
 * 
 */

const Buy = require( '../models/buy.model' );

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

  // Saco de la fecha de compra el mes
  const mes = req.body.date.slice( -7 );

  // Construyo el cuerpo de la compra
  const compra = new Buy({
    ...req.body,
    "date": fecha,
    "month": mes,
    "idUser": _id
  });

  try {
    
    const guardado  = await compra.save();
    logger.debug( `Guardando ${ guardado }`);

    res.json({
      ok: true,
      compra: guardado
    });

  } catch (error) {
    logger.error( `crear - ${ _id } - ${ error }` );

    res.status(500).json({
      ok: false,
      msg: 'Error inesperado, comuniquese con el Adminstrador'
    });
  }


}

const listar = async ( req, res ) => {

  const mes = req.query.mes || ("0" + (new Date().getMonth() + 1)).slice(-2) + '/' + (new Date().getFullYear() );

  try {
    
    logger.debug( `Buscando gastos para el mes de ${ mes }`);
    const gastosMensuales = await Buy.find( { month: mes } );
    
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
      total += suma.amount;
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

/*****************************************************************************
 * 
 * Exportación de controlladores
 * 
 */
module.exports = {
  crear,
  listar
}

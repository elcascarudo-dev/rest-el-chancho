/*****************************************************************************
 * 
 * Importación de paquetes
 * 
 */
const fs = require( 'fs' );
const path = require( 'path' );
const logger = require('log4js').getLogger('upload');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

/*****************************************************************************
 * 
 * Modelo
 * 
 */
const Usuario   = require( '../models/users.model' );


/*****************************************************************************
 * 
 * Cargar imagenes
 * 
 * El parametro "tipo" es obligatorio y debe ser:
 * -> profile
 * 
 */
const uploadPhoto = async ( req, res ) => {

  const _id  = req.params.id;
  const tipo = req.params.type;


  logger.debug( `Id Ingresado ${ _id } para actualizar` );

  if( !mongoose.Types.ObjectId.isValid( _id ) ){
    logger.warn( `El ID ${ _id } no tiene un formato valido` );
    return res.json({
      ok: false,
      msg: `El ID ${ _id } no tiene un formato valido`
    });
  }

  // Valido si se envio algun archivo
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok: false,
      msh: 'No hay imagen para poder subir'
    });
  }

  // Valido que el tipo sea el permitido
  const tipoPermitido = [ 'profile' ];
  
  if ( !tipoPermitido.includes( tipo ) ) {
    return res.status(400).json({
      ok: false,
      msh: `Los tipos permitidos son ${ tipoPermitido.join( ', ' ) }`
    });
  }

  // Procesar Imagen
  const file = req.files.imagen;

  const nombreCortado = file.name.split('.');
  const extencionArchio = nombreCortado[ nombreCortado.length - 1 ];
  
  const extencionesValidas = [ 'png', 'jpg', 'jpeg', 'gif', 'JPG' ];

  if ( !extencionesValidas.includes( extencionArchio ) ) {
    return res.status(400).json({
      ok: false,
      msh: 'No es una extención permitida'
    });
  }

  //Genero un nombre de archivo unico
  const nombreArchivo = `${ uuidv4() }.${ extencionArchio }`;
  // Path para guardar imagen
  const path = `./uploads/${ tipo }/${ nombreArchivo }`;

  // Muevo la imagen al directorio seleccionado
  file.mv( path, (err) => {
  
    if (err){
      logger.error( `Error al mover la imagen al servidor: ${ err }` );

      return res.status(500).json({
        ok: false,
        msh: 'Error al mover la imagen'
      });
    }
    
  });


  switch ( tipo ) {
    //---------------------------------------------------------
    // Actualizar imagen profile
    case 'profile':
        try {
      
          const usuarioDB = await Usuario.findById( {_id: _id} );
      
          if( fs.existsSync( `./uploads/profile/${ usuarioDB.img }` ) ){
            // Borro la imagen del path
            fs.unlinkSync( `./uploads/profile/${ usuarioDB.img }` );
          }
          // Agrego la nueva imagen
          usuarioDB.img = nombreArchivo;
          // Actualizo la BBDD
          const usrActualizado = await usuarioDB.save();
      
          res.json({
            ok: true,
            usuario: usrActualizado
          });
      
        } catch (error) {
          logger.error( error );

          /************************************************************************
           *  Si se genero error al realizar el UpDate se elimina la imagen subida
           ************************************************************************/
          fs.unlinkSync( path );

      
          return res.status(500).json({
            ok: false,
            msh: 'Ocurrio un error'
          });
        }
      break;
  
    }

}



/*********************************************************************************************
 * 
 * Ver fotos
 * 
 */

const viewPhoto = async ( req, res ) => {

  const imagen = req.params.image;
  const tipo   = req.params.type;

  // Busco la imagen que mando por los parametros
  const pathFoto = path.join( __dirname, `../uploads/${ tipo }/${ imagen }` );
  // Imagen por defecto cuando no hay imagen 
  const noImage = path.join( __dirname, `../uploads/no-image.png` );

  // Devuelvo la imagen que corresponda
  if( fs.existsSync( pathFoto ) ){
    res.sendFile( pathFoto );
  } else {
    res.sendFile( noImage );
  }


}


module.exports = {
  uploadPhoto,
  viewPhoto
}
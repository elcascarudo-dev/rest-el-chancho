/*****************************************************************************
 * 
 * Importación de paquetes
 * 
 */
 const { Router } = require( 'express' );
 const { check } = require( 'express-validator' );
 
 /*****************************************************************************
  * 
  * Middlewares
  * 
  */
 const { validarJWT } = require( '../middleware/validar-jwt.middleware' );
 const { validarCampos } = require('../middleware/validar-campos.middleware');
 
 /*****************************************************************************
  * 
  * Controladores
  * 
  */
const { 
        crear,
        listar
      } = require( '../controllers/buy.controller' );

const router = Router();

/*****************************************************************************
 * Ruta usuarios
 * 
 * /api/buy
 */

router.post( '/', validarJWT,  crear );
router.get( '/', validarJWT,  listar );


/*****************************************************************************
 * 
 * Exporto las rutas
 * 
 */
 module.exports = router;
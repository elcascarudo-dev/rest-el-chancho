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
        listar,
        eliminar
      } = require( '../controllers/credit-card.controller' );

const router = Router();

/*****************************************************************************
 * Ruta usuarios
 * 
 * /api/buy
 */

router.post( '/', validarJWT,  crear );
router.get( '/', validarJWT,  listar );
router.delete( '/:registry', validarJWT,  eliminar );


/*****************************************************************************
 * 
 * Exporto las rutas
 * 
 */
 module.exports = router;
const Router = require('express')
const router = Router()
const authHandler = require("./com/handlers/auth")
const resetPasswordHandler = require("./com/handlers/reset_password")
const permissionsHandler = require("./com/handlers/permissions")
const helper = require("./com/services/helper")

router.post("/login", authHandler.login)
router.post("/signup", authHandler.signup)
router.get("/verify_account/:id/:code", authHandler.verifyAccount)

router.post("/forget_password", resetPasswordHandler.request_password_reset)
router.post("/reset_password/:token", resetPasswordHandler.update_after_reset_password)
router.post("/update_password", resetPasswordHandler.update_password_after_sign_in)

router.post("/permissions/create", permissionsHandler.create_new_permission)
router.post("/permissions/grant", permissionsHandler.grant_permission)
router.post("/permissions/revoke", permissionsHandler.revoke_permission)
router.post("/permissions/check", permissionsHandler.check_permissions)
router.post("/permissions/check/admin", permissionsHandler.is_admin)

router.get("/grab-all-rows/:table_name", async (req, res) => {
  try {
    const tableName = req.params.table_name
    const data = await helper.grab_all_rows(tableName)
    return res.json({rows: data.rows, data: data})
  } catch (err) {
    return res.json({error: err})
  }
})
router.post("/drop-table/:table_name", async (req, res) => {
  try {
    const tableName = req.params.table_name
    const data = await helper.drop_table(tableName)
    return res.json({message: "done!"})

  } catch (err) {
    return res.json({error: err})
  }
})
router.post("/delete-all-rows/:table_name", async (req, res) => {
  try {
    const tableName = req.params.table_name
    const data = await helper.delete_all_rows(tableName)
    return res.json({message: "done!"})

  } catch (err) {
    return res.json({error: err})
  }
})


router.get("/", (req, res) => res.type('html').send(html));
router.get("/super-secret-resource", (req, res) => {
  res.status(401).json({ message: "You need to be logged in to access this resource" })
})


const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello from Render!
    </section>
  </body>
</html>
`

module.exports = router
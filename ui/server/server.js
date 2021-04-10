const path = require('path');
const fs = require('fs');
const express = require('express');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const dotenv = require('dotenv');
const { ServerStyleSheet } = require('styled-components');
import Loader from '../src/loader'

const PORT = 3000
const app = express()
const router = express.Router()
dotenv.config();

const serverRenderer = (req, res, next) => {
  const filePath = path.resolve(__dirname, '..', 'build', 'index.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
      return res.status(500).send('An error occurred')
    }
    const jsx = <Loader environment={process.env.REACT_APP_ENVIRONMENT}/>
    const css = new ServerStyleSheet();
    const markup = ReactDOMServer.renderToString(css.collectStyles(jsx));
    const html = data.replace('{{CSS}}', css.getStyleTags());
    return res.send(
      html.replace(
        '<div id="root"></div>',
        `<div id="root">${markup}</div>`
      ).replace(
        '<div id="csr"></div>',
        `<div id="ssr"></div>`
      )
    )
  })
}


router.use('^/$', serverRenderer)
router.use(
  express.static(path.resolve(__dirname, '..', 'build'))
)
router.use(
  express.static(path.resolve(__dirname, '../public'))
)
router.use('*', serverRenderer);



app.use(router)

app.listen(PORT, () => {
  console.log(`SSR running on port ${PORT}`)
})
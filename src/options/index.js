import './index.css'

const crx = 'textcompletion'
document.querySelector('#app').innerHTML = `
  <main>
  <h3>Options Page!</h3>

  <h6>v 0.0.0</h6>

  <a
    href="https://www.npmjs.com/package/create-chrome-ext"
    target="_blank"
  >
    Power by ${crx}
  </a>
  </main>
`

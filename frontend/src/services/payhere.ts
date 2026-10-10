import type { PayHereForm } from './api'


export function redirectToPayHere(form: PayHereForm) {
  const el = document.createElement('form')
  el.method = 'POST'
  el.action = form.url

  Object.entries(form.fields).forEach(([name, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    el.appendChild(input)
  })

  document.body.appendChild(el)
  el.submit()
}
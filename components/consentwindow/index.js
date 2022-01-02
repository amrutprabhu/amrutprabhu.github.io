import { Consent } from './consent'
import Cookies from 'js-cookie'
import Analytics from '../analytics'

export default function ConsentWindow() {
  function renderComponent() {
    if (Cookies.get('cookie-consent') === 'true') {
      return (
        <div>
          <Analytics />
        </div>
      )
    } else {
      return (
        <div>
          <Consent />
        </div>
      )
    }
  }
  return <div>{renderComponent()}</div>
}

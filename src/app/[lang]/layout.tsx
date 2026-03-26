// Next Imports
import { headers } from 'next/headers'

import Script from 'next/script'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports

// HOC Imports
import TranslationWrapper from '@/hocs/TranslationWrapper'

// Config Imports
import { i18n } from '@configs/i18n'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

export const metadata = {
  title: 'EH- Remote Clinic ',
  description:
    'DDB is a platform that allows you to create, manage, and promote events. It is a one-stop solution for all your event management needs.'
}

const RootLayout = ({ children, params }: ChildrenType & { params: { lang: Locale } }) => {
  // Vars
  const headersList = headers()
  const direction = i18n.langDirection[params.lang]

  return (
    <TranslationWrapper headersList={headersList} lang={params.lang}>
      <html id='__next' lang={params.lang} dir={direction}>
        <head>
          <Script src='/websdk/websdk.client.bundle.min.js' strategy='beforeInteractive' />
        </head>
        <body className='flex is-full min-bs-full flex-auto flex-col'>{children}
          <a
  href="https://wa.me/923091419331"
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-5 right-5 z-50 w-16 h-16 rounded-full overflow-hidden shadow-lg"
>
  <img
    src="/images/whatsapplogo.png"
    alt="WhatsApp"
    className="w-full h-full object-cover"
  />
</a>
        </body>
      </html>
    </TranslationWrapper>
  )
}

export default RootLayout

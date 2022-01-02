import { MDXLayoutRenderer } from '@/components/MDXComponents'
import { getFileBySlug } from '@/lib/mdx'
import Router from 'next/router'
import Cookies from 'js-cookie'

const DEFAULT_LAYOUT = 'Policy'

export async function getStaticProps() {
  const authorDetails = await getFileBySlug('privacy', ['default'])
  return { props: { authorDetails } }
}

export default function Privacy({ authorDetails }) {
  const { mdxSource, frontMatter } = authorDetails
  function acceptCookies() {
    //TODO: Fix this
    Cookies.remove('cookie-*')
    Router.reload(window.location.pathname)
  }
  return (
    <div>
      <MDXLayoutRenderer
        layout={frontMatter.layout || DEFAULT_LAYOUT}
        mdxSource={mdxSource}
        frontMatter={frontMatter}
      />
      <a onClick={acceptCookies}>Stop Collectiing Usage Data</a>
    </div>
  )
}

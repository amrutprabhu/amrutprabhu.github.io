import { MDXLayoutRenderer } from '@/components/MDXComponents'
import { getFileBySlug } from '@/lib/mdx'
import Router from 'next/router'
import Link from '@/components/Link'

const DEFAULT_LAYOUT = 'Policy'

export async function getStaticProps() {
  const privacyPolicyDetails = await getFileBySlug('privacy', ['default'])
  return { props: { privacyPolicyDetails } }
}

export default function Privacy({ privacyPolicyDetails }) {
  const { mdxSource, frontMatter } = privacyPolicyDetails
  function deleteCookies() {
    //TODO: Fix this
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
    })
    Router.reload(window.location.pathname)
  }
  return (
    <div className="mb-10">
      <MDXLayoutRenderer layout={DEFAULT_LAYOUT} mdxSource={mdxSource} frontMatter={frontMatter} />
      <Link href="javascript:;" className=" bg-rose-500 rounded p-2 " onClick={deleteCookies}>
        Stop Collecting Usage Data
      </Link>
    </div>
  )
}

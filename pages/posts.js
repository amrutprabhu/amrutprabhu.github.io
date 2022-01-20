import { getAllFilesFrontMatter } from '@/lib/mdx'
import Link from '@/components/Link'
import formatDate from '@/lib/utils/formatDate'

export async function getStaticProps() {
  const posts = await getAllFilesFrontMatter('blog')
  return { props: { posts } }
}

export default function posts({ posts }) {
  return (
    <>
      <div className="mb-8 ">
        <div className="pt-6 pb-8 space-y-2 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            All Posts
          </h1>
        </div>
        <hr />
        {posts.map((frontMatter) => {
          const { slug, date, title } = frontMatter
          return (
            <>
              <div className="mt-3">
                <Link href={`/${slug}`}>
                  <div className="grid grid-cols-8 hover:bg-teal-500 hover:dark:bg-slate-500 rounded p-4">
                    <div className="col-span-2">
                      <time className="float-left" dateTime={date}>
                        {formatDate(date)}
                      </time>
                    </div>
                    <div className="col-span-6 ml-4">{title}</div>
                  </div>
                </Link>
              </div>
            </>
          )
        })}
      </div>
    </>
  )
}
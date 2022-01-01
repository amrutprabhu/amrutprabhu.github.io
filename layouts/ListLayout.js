import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { useState } from 'react'
import Pagination from '@/components/Pagination'
import formatDate from '@/lib/utils/formatDate'
import Image from '@/components/Image'

export default function ListLayout({
  posts,
  title,
  initialDisplayPosts = [],
  authorDetails,
  pagination,
}) {
  const [searchValue, setSearchValue] = useState('')
  const filteredBlogPosts = posts.filter((frontMatter) => {
    const searchContent = frontMatter.title + frontMatter.summary + frontMatter.tags.join(' ')
    return searchContent.toLowerCase().includes(searchValue.toLowerCase())
  })

  // If initialDisplayPosts exist, display it if no searchValue is specified
  const displayPosts =
    initialDisplayPosts.length > 0 && !searchValue ? initialDisplayPosts : filteredBlogPosts
  return (
    <>
      <div className="divide-y">
        <div className="pt-6 pb-8 space-y-2 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {title}
          </h1>
          <div className="relative max-w-lg">
            <input
              aria-label="Search articles"
              type="text"
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search articles"
              className="block w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-md dark:border-gray-900 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-gray-100"
            />
            <svg
              className="absolute w-5 h-5 text-gray-400 right-3 top-3 dark:text-gray-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <ul>
          {!filteredBlogPosts.length && 'No posts found.'}
          {displayPosts.map((frontMatter) => {
            const { slug, date, title, summary, tags, imageUrl } = frontMatter
            return (
              <li key={slug} className="py-4">
                <article className="space-y-1 xl:space-y-0 xl:items-baseline">
                  <div className="space-y-3 xl:grid xl:grid-cols-4">
                    <div className="xl:col-span-2 xl:mr-4">
                      <h3 className="text-2xl font-bold leading-8 tracking-tight">
                        <Link href={`/${slug}`} className="text-gray-900 dark:text-gray-100">
                          <Image
                            alt={title}
                            src={imageUrl}
                            className="object-cover object-center lg:h-58 md:h-36"
                            width={844}
                            height={406}
                          />
                        </Link>
                      </h3>
                    </div>
                    <div className="xl:col-span-2 grid grid-cols-2">
                      <h3 className="text-2xl font-bold leading-8 tracking-tight col-span-2">
                        <Link href={`/${slug}`} className="text-gray-900 dark:text-gray-100">
                          <div>{title}</div>
                        </Link>
                      </h3>
                      <div className="flex flex-wrap mt-2 col-span-2">
                        {tags.map((tag) => (
                          <Tag key={tag} text={tag} />
                        ))}
                      </div>
                      <div className="prose text-gray-500 max-w-none dark:text-gray-400 col-span-2">
                        {summary}
                        <br />
                        <Link
                          href={`/${slug}`}
                          className="text-base font-medium leading-6 text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 ml-4 float-right"
                          aria-label={`Link to ${title}`}
                        >
                          Read more &rarr;
                        </Link>
                      </div>
                      <div className="mt-5  col-span-2 grid grid-cols-2 ">
                        <div className="col-span-1 ">
                          {authorDetails.map((author) => (
                            <li className="flex items-center space-x-2" key={author.name}>
                              {author.avatar && (
                                <Image
                                  src={author.avatar}
                                  width="38px"
                                  height="38px"
                                  alt="avatar"
                                  className="w-10 h-10 rounded-full"
                                />
                              )}
                              <dl className="text-sm font-medium leading-5 whitespace-nowrap">
                                <dt className="sr-only">Name</dt>
                                <dd className="text-gray-900 dark:text-gray-100">{author.name}</dd>
                                <dt className="sr-only">Twitter</dt>
                                <dd>
                                  {author.twitter && (
                                    <Link
                                      href={author.twitter}
                                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                                    >
                                      {author.twitter.replace('https://twitter.com/', '@')}
                                    </Link>
                                  )}
                                </dd>
                              </dl>
                            </li>
                          ))}
                        </div>
                        <div className="col-span-1 ">
                          <time className="float-right" dateTime={date}>
                            {formatDate(date)}
                          </time>
                        </div>
                      </div>
                    </div>
                    <br />
                  </div>
                  <hr />
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {pagination && pagination.totalPages > 1 && !searchValue && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      )}
    </>
  )
}

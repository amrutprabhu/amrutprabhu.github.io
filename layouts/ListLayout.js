import { useState } from 'react'
import Pagination from '@/components/Pagination'
import ListRecord from '@/components/ListRecord'
import Image from '@/components/Image'
import AdColumn from '@/components/AdColumn'
import Script from 'next/script'
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
        <div className="xl:flex content-wrapper">
          <div>
            <ul>
              {!filteredBlogPosts.length && 'No posts found.'}
              {displayPosts.map((frontMatter) => {
                return (
                  <ListRecord
                    key={frontMatter}
                    frontMatter={frontMatter}
                    authorDetails={authorDetails}
                  />
                )
              })}
            </ul>
            {pagination && pagination.totalPages > 1 && !searchValue && (
              <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
            )}
          </div>
          <div>
            <div className="hidden xl:block">
              <AdColumn
                width="900"
                height="2150"
                imageLink="/static/images/promotion/testing-spring-boot-applications-masterclass.png"
                referalLink="https://www.copecart.com/products/521411d4/p/techapk42"
              />
            </div>

            <div className="bg-green-500">
              <ins
                className="adsbygoogle1"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-7490174059724719"
                data-ad-slot="1649763058"
                data-ad-format="auto"
                data-full-width-responsive="true"
              ></ins>
              <Script
                id="add1"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `
                (adsbygoogle1 = window.adsbygoogle1 || []).push({});
            `,
                }}
              />
            </div>
            <div className="bg-cyan-500 hidden xl:block">
              <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-7490174059724719"
                data-ad-slot="6310228644"
                data-ad-format="auto"
                data-full-width-responsive="true"
              ></ins>
              <Script
                id="add"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `
                (adsbygoogle = window.adsbygoogle || []).push({});
            `,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

import React from 'react'
import Image from './Image'
import Link from '@/components/Link'
function AdColumn() {
  return (
    <div className="border-4 border-teal-500 rounded-lg p-1">
      <Link href="https://www.google.com">
        <Image
          alt="title"
          src="/static/images/promotion/testing-spring-boot.png"
          className="object-cover object-center "
          width={954}
          height={1700}
        />
      </Link>
    </div>
  )
}

export default AdColumn

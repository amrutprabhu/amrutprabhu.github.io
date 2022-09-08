import React from 'react'
import Image from './Image'
import Link from '@/components/Link'
function AdColumn() {
  return (
    <div className="border-4 border-teal-500 rounded-lg p-1">
      <Link href="https://transactions.sendowl.com/stores/15382/235788">
        <Image
          alt="title"
          src="/static/images/promotion/testing-toolbox-600x800.png"
          className="object-cover object-center "
          width={1054}
          height={1700}
        />
      </Link>
    </div>
  )
}

export default AdColumn

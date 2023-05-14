import Twitter from './social-icons/twitter.svg'
import Linkedin from './social-icons/linkedin.svg'
import Facebook from './social-icons/facebook.svg'
import Mail from './social-icons//mail.svg'

const ShareButtons = ({ url, title }) => {
  const pageUrl = encodeURIComponent(url)
  const pageTitle = encodeURIComponent(title)

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`,
      'facebook-share-dialog',
      'width=626,height=436'
    )
  }

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/share?url=${pageUrl}&text=${pageTitle}`,
      'twitter-share-dialog',
      'width=626,height=436'
    )
  }

  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`,
      'linkedin-share-dialog',
      'width=626,height=436'
    )
  }

  const shareViaEmail = () => {
    window.location.href = `mailto:?subject=${pageTitle}&body=${pageUrl}`
  }

  return (
    <div>
      <button
        type="button"
        className="text-white bg-[#3b5998] hover:bg-[#3b5998]/90 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center mr-2 mb-2"
        onClick={shareOnFacebook}
      >
        <svg
          className="w-4 h-4 mr-2 -ml-1"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="facebook-f"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <Facebook className={`fill-current`} />
        </svg>
        Share
      </button>
      <button
        type="button"
        className="text-white bg-[#1da1f2] hover:bg-[#1da1f2]/90 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center mr-2 mb-2"
        onClick={shareOnTwitter}
      >
        <svg
          className="w-4 h-4 mr-2 -ml-1"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="twitter"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <Twitter className={`fill-current`} />
        </svg>
        Tweet
      </button>
      <button
        type="button"
        className="text-white bg-[#0077B5] hover:bg-[#00A0DC]/90 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center mr-2 mb-2"
        onClick={shareOnLinkedIn}
      >
        <svg
          className="w-4 h-4 mr-2 -ml-1"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="linkedin"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <Linkedin className="fill-current" />
        </svg>
        Post
      </button>
      <button
        type="button"
        className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center mr-2 mb-2"
        onClick={shareViaEmail}
      >
        <svg
          className="w-4 h-4 mr-2 -ml-1"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="email"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <Mail className="fill-current" />
        </svg>
        Share
      </button>
    </div>
  )
}

export default ShareButtons

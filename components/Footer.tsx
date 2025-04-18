import { FaLocationArrow, FaXTwitter } from 'react-icons/fa6'

import MagicButton from './ui/MagicButton'
import { FiGithub } from 'react-icons/fi'
import { CiLinkedin } from 'react-icons/ci'

const Footer = () => {
  return (
    <footer className="xl:max-w-5xl  pt-0 pb-24 " id="contact">
      {/* background grid */}
      <div className="w-full absolute left-0 1sm:-translate-y-52 -bottom-72 min-h-96 pointer-events-none">
         <img
           src="/footer-grid.svg"
           alt="grid"
           className="w-full h-full opacity-50 z-10 pointer-events-none"
        />
        </div>


      <div className="flex flex-col items-center">
        <h1 className="heading lg:max-w-[45vw]">
          Ready to bring <span className="block text-purple-500">fresh talent</span> to your team?
        </h1>
        <p className="text-white-200 mb-6 mt-14 px-5   text-center">
          Let&apos;s connect and explore how I can add value to your team.
        </p>
        <div className="pb-10">
          <a href="mailto:nathancwatkins@gmail.com">
            <MagicButton title="Let's get in touch" icon={<FaLocationArrow />} position="right" />
          </a>
        </div>
      </div>
      <div className="flex mt-16 md:flex-row flex-col-reverse justify-between items-center md:mx-10">
        <p className="md:text-base text-sm md:font-normal font-light">
          Copyright © 2025 Nathan Watkins
        </p>

        <div className="flex items-center justify-center pb-2 gap-3  z-50">
          <a href="https://github.com/natkins23" target="_blank" rel="noopener noreferrer">
            <div className="w-12 h-12 rounded-full hover:bg-blue-300/30 dark:hover:bg-slate-900">
              <FiGithub className="w-full h-full p-3" />
            </div>
          </a>
          <a
            href="https://www.linkedin.com/in/nathancwatkins/"
            target="_blank"
            rel="noopener noreferrer">
            <div className="w-12 h-12 rounded-full hover:bg-blue-300/30 dark:hover:bg-slate-900">
              <CiLinkedin className="w-full h-full p-2" />
            </div>
          </a>
          <a href="https://x.com/nathancwatkins" target="_blank" rel="noopener noreferrer">
            <div className="w-12 h-12 rounded-full hover:bg-blue-300/30 dark:hover:bg-slate-900">
              <FaXTwitter className="w-full h-full p-3" />
            </div>
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer

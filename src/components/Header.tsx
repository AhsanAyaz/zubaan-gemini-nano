const Header = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm shadow-white">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">Zubaan</a>
      </div>
      <div className="tooltip tooltip-primary tooltip-left" data-tip="How to enable Gemini Nano">
        <a
          rel="noopener noreferrer"
          href="https://github.com/AhsanAyaz/zubaan-gemini-nano?tab=readme-ov-file#enable-ai-in-chrome"
          target="_blank"
          className="btn btn-ghost"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
            />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default Header;

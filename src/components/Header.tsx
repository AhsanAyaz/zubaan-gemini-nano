const Header = () => {
  return (
    <div className="navbar bg-base-100 shadow-sm shadow-white">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">Zubaan - Gemini Nano</a>
      </div>
      <a
        className="btn btn-ghost"
        href="https://github.com/AhsanAyaz/zubaan-gemini-nano"
        target="_blank"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={24}
          height={24}
          fill={"#fff"}
        >
          <path d="M12 0.297c-6.627 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387 0.6 0.11 0.82-0.261 0.82-0.577 0-0.285-0.011-1.04-0.016-2.04-3.338 0.724-4.042-1.61-4.042-1.61-0.546-1.387-1.333-1.757-1.333-1.757-1.089-0.745 0.083-0.729 0.083-0.729 1.205 0.084 1.839 1.236 1.839 1.236 1.07 1.834 2.809 1.304 3.495 0.997 0.109-0.776 0.418-1.305 0.76-1.605-2.665-0.305-5.467-1.332-5.467-5.93 0-1.31 0.468-2.381 1.235-3.221-0.123-0.303-0.535-1.524 0.118-3.176 0 0 1.008-0.322 3.301 1.23 0.957-0.266 1.983-0.399 3.003-0.404 1.02 0.005 2.047 0.138 3.006 0.404 2.291-1.552 3.297-1.23 3.297-1.23 0.655 1.653 0.243 2.874 0.12 3.176 0.77 0.84 1.233 1.911 1.233 3.221 0 4.609-2.807 5.623-5.48 5.921 0.43 0.371 0.823 1.102 0.823 2.222 0 1.606-0.015 2.899-0.015 3.293 0 0.319 0.216 0.694 0.825 0.576 4.765-1.588 8.198-6.084 8.198-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      </a>
      <div
        className="tooltip tooltip-primary tooltip-left"
        data-tip="How to enable Gemini Nano"
      >
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

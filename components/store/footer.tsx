interface FooterSettings {
  storeName: string;
  tagline: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
}

export function StoreFooter({ settings }: { settings: FooterSettings | null }) {
  const storeName = settings?.storeName || "Store";
  const socials = [
    { url: settings?.instagramUrl, label: "Instagram" },
    { url: settings?.facebookUrl, label: "Facebook" },
    { url: settings?.twitterUrl, label: "X" },
    { url: settings?.youtubeUrl, label: "YouTube" },
    { url: settings?.tiktokUrl, label: "TikTok" },
  ].filter((s) => s.url);

  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">{storeName}</p>
            {settings?.tagline && (
              <p className="text-xs text-gray-500 mt-0.5">{settings.tagline}</p>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 sm:items-end">
            {socials.length > 0 && (
              <div className="flex items-center gap-3">
                {socials.map(({ url, label }) => (
                  <a
                    key={label}
                    href={url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}
            {settings?.email && (
              <a
                href={`mailto:${settings.email}`}
                className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
              >
                {settings.email}
              </a>
            )}
          </div>
        </div>
        <div className="mt-6 border-t border-gray-100 pt-4">
          <p className="text-center text-xs text-gray-400">
            © {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

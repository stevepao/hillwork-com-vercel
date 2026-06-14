import {ArrowLeft, ExternalLink, Newspaper} from 'lucide-react';
import {pressArticles} from '../data/pressArticles';

const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export default function PressPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased selection:bg-stone-900/10 selection:text-stone-950">
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <a href="/" className="flex items-center gap-1 group">
              <span className="font-display text-2xl font-black text-stone-900 tracking-tight transition-transform duration-300 group-hover:scale-[1.01] uppercase">
                Hillwork
              </span>
              <span className="h-2 w-2 rounded-full bg-sky-500 inline-block translate-y-1.5 transition-all duration-500 group-hover:scale-125"></span>
            </a>

            <a
              href="/"
              className="inline-flex items-center gap-2 font-display font-bold text-xs tracking-widest text-stone-500 hover:text-stone-900 uppercase transition-colors"
            >
              <ArrowLeft size={14} />
              Back Home
            </a>
          </div>
        </div>
      </header>

      <main className="relative py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 sm:p-12 lg:p-14 mb-6">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-mono font-extrabold text-stone-400 mb-4">
                <Newspaper size={14} className="text-sky-500" />
                Media Archive
              </span>
              <h1 className="font-display font-bold text-4xl sm:text-5xl text-stone-900 tracking-tight leading-tight">
                Selected Press
              </h1>
              <p className="mt-5 text-base sm:text-lg text-stone-500 leading-relaxed">
                A short archive of selected articles, interviews, and personal-interest stories from operating roles and life outside the office. This is not a complete press archive; it is included for clients who want context on past media experience.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {pressArticles.map((article) => (
              <article
                key={`${article.publication}-${article.date}-${article.title}`}
                className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col min-h-[260px]"
              >
                <div className="h-20 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center px-5 mb-5">
                  <img
                    src={article.image}
                    alt={`${article.publication} logo`}
                    loading="lazy"
                    className="max-h-12 max-w-full object-contain"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] font-bold text-stone-400">
                    {article.publication}
                  </span>
                  <time className="text-[11px] font-bold text-stone-400" dateTime={article.date}>
                    {dateFormatter.format(new Date(article.date))}
                  </time>
                </div>

                <h2 className="font-display text-xl font-bold tracking-tight leading-snug text-stone-900">
                  {article.title}
                </h2>

                <div className="mt-auto pt-6">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-950 transition-colors"
                  >
                    Read Article
                    <ExternalLink size={13} />
                  </a>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}

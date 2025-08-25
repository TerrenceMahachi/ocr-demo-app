export default function Footer() {
    const year = new Date().getFullYear();
    return (
      <footer className="border-t bg-white">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-gray-600 md:flex-row md:px-6">
          <div>© Terrence Mahachi |  {year} OCR Demo APP</div>
          <div className="flex items-center gap-4">
            <a href="/" className="hover:underline">Capture Record</a>
            <a href="/records" className="hover:underline">View Records</a>
          </div>
        </div>
      </footer>
    );
  }
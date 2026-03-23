export default function Footer() {
  return (
    <footer className="border-t border-gray-300 py-12 mt-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-widest leading-none">© {new Date().getFullYear()} MAXM Studio. Skeleton Mode.</p>
        <p className="text-gray-500 text-xs font-medium uppercase tracking-widest leading-none">High-Fidelity Audio Services</p>
      </div>
    </footer>
  );
}

interface DarkwaveFooterProps {
  product?: string;
}

export const DarkwaveFooter: React.FC<DarkwaveFooterProps> = ({ product = "Lot Ops Pro" }) => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/50 py-8 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-2">
        <div className="text-[10px] text-slate-400 uppercase tracking-widest">Powered By</div>
        <div className="text-xs font-bold text-slate-300">DARKWAVE STUDIOS</div>
      </div>
    </footer>
  );
};

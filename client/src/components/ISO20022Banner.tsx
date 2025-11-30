import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Lock, X, Info, Sparkles, Building2, Globe, ShieldCheck, Zap } from "lucide-react";

export function ISO20022Banner() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/60 to-blue-950/60 border-b border-blue-500/40 py-3 sm:py-6">
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-shrink-0">
                <Lock className="w-6 h-6 text-blue-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-blue-300">
                  ISO 20022 Banking Compliance Coming Q3-Q4 2026
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Direct bank integration • Enterprise-grade payroll • Fortune 500 ready
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPopup(true)}
              className="flex items-center gap-2 text-xs sm:text-sm text-blue-300 bg-blue-900/40 px-3 py-2 rounded-lg border border-blue-500/30 hover:bg-blue-800/50 hover:border-blue-400/50 transition-all cursor-pointer group"
              data-testid="button-iso20022-info"
            >
              <Info className="w-4 h-4 group-hover:animate-pulse" />
              <span>Learn More</span>
            </button>
          </div>
        </div>
      </div>

      {/* ISO 20022 Explanation Popup with Animated Orby */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Animated Orby */}
              <div className="relative p-6 border-b border-cyan-500/20">
                <button
                  onClick={() => setShowPopup(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/50 text-gray-400 hover:text-white hover:bg-red-600/50 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-start gap-4">
                  {/* Animated Orby Mascot */}
                  <motion.div
                    initial={{ x: -100, rotate: -180, opacity: 0 }}
                    animate={{ x: 0, rotate: 0, opacity: 1 }}
                    transition={{ 
                      type: "spring", 
                      damping: 12, 
                      stiffness: 100,
                      delay: 0.2 
                    }}
                    className="relative flex-shrink-0"
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -8, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="relative"
                    >
                      {/* Saturn Ring */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-6 border-2 border-cyan-400/60 rounded-full rotate-[-20deg]" />
                      
                      {/* Planet Body */}
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50 flex items-center justify-center relative z-10">
                        {/* Face */}
                        <div className="flex flex-col items-center">
                          <div className="flex gap-2 mb-1">
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-2 h-2 bg-white rounded-full"
                            />
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                              className="w-2 h-2 bg-white rounded-full"
                            />
                          </div>
                          <div className="w-4 h-2 border-b-2 border-white rounded-b-full" />
                        </div>
                      </div>

                      {/* Sparkles */}
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute -top-1 -right-1"
                      >
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  <div className="flex-1">
                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Lock className="w-6 h-6 text-cyan-400" />
                        ISO 20022 Compliance
                      </h2>
                      <p className="text-cyan-300 mt-1">
                        The future of global financial messaging
                      </p>
                    </motion.div>
                  </div>
                </div>

                {/* Speech Bubble from Orby */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="mt-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 relative"
                >
                  <div className="absolute -top-2 left-10 w-4 h-4 bg-cyan-500/10 border-l border-t border-cyan-500/30 rotate-45" />
                  <p className="text-cyan-100 text-sm italic">
                    "Hey there! I'm Orby, your ORBIT guide. Let me explain why ISO 20022 is a game-changer 
                    for staffing agencies and how it positions us ahead of the competition!"
                  </p>
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* What is ISO 20022 */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-400" />
                    What is ISO 20022?
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    ISO 20022 is the new global standard for financial messaging that enables richer, more structured 
                    data in payment transactions. By 2026, major payment networks worldwide (SWIFT, Fedwire, CHIPS) 
                    will transition to this standard, making it essential for enterprise-grade financial operations.
                  </p>
                </motion.div>

                {/* Why It Matters */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div className="bg-blue-950/40 rounded-xl p-4 border border-blue-500/20">
                    <Building2 className="w-8 h-8 text-blue-400 mb-2" />
                    <h4 className="font-bold text-white text-sm mb-1">Direct Bank Integration</h4>
                    <p className="text-xs text-gray-400">
                      Bypass third-party processors and connect directly with banks for faster, cheaper payroll processing.
                    </p>
                  </div>
                  <div className="bg-blue-950/40 rounded-xl p-4 border border-blue-500/20">
                    <Zap className="w-8 h-8 text-yellow-400 mb-2" />
                    <h4 className="font-bold text-white text-sm mb-1">Instant Payments</h4>
                    <p className="text-xs text-gray-400">
                      Same-day or real-time payment settlement for workers, improving retention and satisfaction.
                    </p>
                  </div>
                  <div className="bg-blue-950/40 rounded-xl p-4 border border-blue-500/20">
                    <ShieldCheck className="w-8 h-8 text-green-400 mb-2" />
                    <h4 className="font-bold text-white text-sm mb-1">Enhanced Compliance</h4>
                    <p className="text-xs text-gray-400">
                      Rich transaction data supports AML/KYC requirements and provides complete audit trails.
                    </p>
                  </div>
                  <div className="bg-blue-950/40 rounded-xl p-4 border border-blue-500/20">
                    <TrendingUp className="w-8 h-8 text-purple-400 mb-2" />
                    <h4 className="font-bold text-white text-sm mb-1">Fortune 500 Ready</h4>
                    <p className="text-xs text-gray-400">
                      Enterprise clients require ISO 20022 compliance. We're building this capability early.
                    </p>
                  </div>
                </motion.div>

                {/* Competitive Advantage */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-xl p-4 border border-cyan-500/30"
                >
                  <h3 className="text-lg font-bold text-cyan-300 mb-2">ORBIT's Competitive Edge</h3>
                  <p className="text-sm text-gray-300">
                    While competitors are still using legacy payment systems, ORBIT is engineering ISO 20022 
                    compliance from the ground up. This positions our franchise partners and clients for 
                    seamless transition when the mandate takes effect, with no costly retrofitting or 
                    service interruptions.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-cyan-400">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    Target Implementation: Q3-Q4 2026
                  </div>
                </motion.div>

                {/* Close Button */}
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  onClick={() => setShowPopup(false)}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all"
                  data-testid="button-close-iso20022-popup"
                >
                  Got It!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

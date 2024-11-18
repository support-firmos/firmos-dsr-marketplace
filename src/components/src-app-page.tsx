'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Add these new types
type SessionData = {
  client?: {
    givenName: string;
    familyName: string;
  };
  company?: {
    name: string;
  };
};

export function BlockPage({ sessionData }: { sessionData: SessionData }) {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPillarModal, setShowPillarModal] = useState(false)
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null)
  const [selectedPillarCombo, setSelectedPillarCombo] = useState<string | null>(null)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const [loadingText, setLoadingText] = useState("Getting things ready...")

  const LOADING_DELAY = 7000; // 7 seconds
  const loadingMessages = [
    "Getting things ready...",
    "Preparing your package...",
    "Almost there!"
  ]

  const pillars = {
    'business-dev': {
      name: 'Business Development',
      description: 'Enhance lead generation and client acquisition strategies.'
    },
    'operations': {
      name: 'Operations',
      description: 'Streamline internal processes and improve efficiency.'
    },
    'talent': {
      name: 'Talent',
      description: 'Optimize talent management and team performance.'
    }
  }

  const pillarCombos = {
    'business-dev-talent': {
      name: 'Business Development + Talent',
      description: 'Boost client acquisition while optimizing team performance.'
    },
    'talent-operations': {
      name: 'Talent + Operations',
      description: 'Enhance team efficiency and streamline internal processes.'
    },
    'business-dev-operations': {
      name: 'Business Development + Operations',
      description: 'Improve client acquisition and internal operational efficiency.'
    }
  }

  const products = [
    {
      id: '1-pillar',
      title: 'FirmOS Growth Platform - Core Focus (1 Pillar)',
      heading: 'FIRMOS GROWTH PLATFORM',
      subtitle: 'Core Focus',
      description: '(1 Pillar)',
      fullDescription: 'Focus on one core area of your firm\'s operations. Choose between Business Development, Operations, or Talent management.',
      price: 2450,
      savings: null,
      features: [
        "1 firm's core operation",
        "Custom AI Workflow Automations",
        "Dedicated Support",
        "Basic Analytics"
      ]
    },
    {
      id: '2-pillars',
      title: 'FirmOS Business Accelerator (2 Pillars)',
      heading: 'FIRMOS BUSINESS ACCELERATOR',
      subtitle: 'Dual Focus',
      description: '(2 Pillars)',
      fullDescription: 'Optimize two critical aspects of your firm\'s operations. Choose any combination of Business Development, Operations, and Talent management.',
      price: 3450,
      savings: 30,
      features: [
        "2 firm's core operations",
        "Custom AI Workflow Automations",
        "Dedicated Support",
        "Advanced Analytics"
      ]
    },
    {
      id: '3-pillars',
      title: 'FirmOS Operations Mastery (3 Pillars)',
      heading: 'FIRMOS OPERATIONS MASTERY',
      subtitle: 'Complete Solution',
      description: '(3 Pillars)',
      fullDescription: 'Full operational support across Business Development, Operations, and Talent management. FirmOS equips you with a complete solution to manage and scale your firm efficiently.',
      price: 4450,
      savings: 40,
      features: [
        "Complete firm's core operations",
        "Custom AI Workflow Automations",
        "Dedicated Support",
        "Advanced Analytics",
        "AI-Driven Insights and Recommendations"
      ]
    },
    {
      id: 'consulting',
      title: 'FirmOS Consulting Subscription',
      heading: 'FIRMOS CONSULTING',
      subtitle: 'BI-WEEKLY STRATEGY',
      description: 'SESSIONS',
      fullDescription: 'Designed for firms needing structured support, this plan offers two 60-minute sessions monthly with tailored advice, templates, and actionable steps to improve operations, optimize strategies, or enhance team performance.',
      price: 750,
      isMonthly: true,
      savings: null,
      features: [
        "Structured Operational Guidance",
        "Actionable Financial Strategy Support",
        "Bi-weekly 60-minute Sessions",
        "Tailored Advice and Templates"
      ]
    }
  ]
  
// Construct the client name
const clientName = sessionData.client 
? `${sessionData.client.givenName} ${sessionData.client.familyName}`
: sessionData.company?.name || "Unknown Client";

  const handleSelectPackage = (productId: string) => {
    setSelectedProduct(productId)
    if (productId === '1-pillar' || productId === '2-pillars') {
      setShowPillarModal(true)
    } else if (productId === '3-pillars') {
      setConfirmationMessage('You have selected the 3-pillar package, which includes Business Development, Operations, and Talent management. Would you like to proceed?')
      setShowConfirmationModal(true)
    } else if (productId === 'consulting') {
      setConfirmationMessage('You have selected the FirmOS Consulting package. Would you like to proceed?')
      setShowConfirmationModal(true)
    }
  }

  const handlePillarSelection = (pillar: string) => {
    if (selectedProduct === '1-pillar') {
      setSelectedPillar(pillar)
    }
  }

  const handlePillarComboSelection = (combo: string) => {
    setSelectedPillarCombo(combo)
  }

  const handlePillarConfirmation = () => {
    setShowPillarModal(false)
    if (selectedProduct === '1-pillar') {
      setConfirmationMessage(`You have selected the ${pillars[selectedPillar as keyof typeof pillars].name} pillar. Would you like to proceed?`)
    } else if (selectedProduct === '2-pillars') {
      setConfirmationMessage(`You have selected the ${pillarCombos[selectedPillarCombo as keyof typeof pillarCombos].name} pillars. Would you like to proceed?`)
    }
    setShowConfirmationModal(true)
  }

  const handleConfirmation = () => {
    setShowConfirmationModal(false)
    setIsLoading(true)
    let currentMessage = 0
    setLoadingText(loadingMessages[currentMessage])
    
    const interval = setInterval(() => {
      currentMessage++
      if (currentMessage < loadingMessages.length) {
        setLoadingText(loadingMessages[currentMessage])
      }
      if (currentMessage >= loadingMessages.length) {
        clearInterval(interval)
        setIsLoading(false)
        window.open('https://app.firmos.ai/contracts?view=templates', '_blank')
      }
    }, LOADING_DELAY / loadingMessages.length)
  }

  useEffect(() => {
    document.title = 'Product Selection'
  }, [])

  return (
    <div className="min-h-screen bg-[#121212] p-6 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-black/60 to-blue-950/40 pointer-events-none" />

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          >
            <div className="text-white text-center relative w-80 h-80">
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0 border-4 border-blue-500 rounded-full"
              />
              
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-4 border-4 border-white rounded-full"
              />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{
                    y: [0, -24, -12, -36, -18, -30, 0],
                  }}
                  transition={{
                    duration: 7,
                    times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1],
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-24 h-6 bg-white rounded-sm"
                />
                <motion.div
                  animate={{
                    y: [0, -18, -36, -24, -12, -30, 0],
                  }}
                  transition={{
                    duration: 7,
                    times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1],
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute w-24 h-6 bg-black rounded-sm border-2 border-white"
                />
                <motion.div
                  animate={{
                    y: [0, -36, -24, -12, -30, -18, 0],
                  }}
                  transition={{
                    duration: 7,
                    times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1],
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-24 h-6 bg-white rounded-sm"
                />
              </div>

              <motion.div 
                className="absolute -bottom-24 left-1/2 transform -translate-x-1/2 w-full"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <p className="text-2xl font-bold whitespace-nowrap bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                  {loadingText}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-6xl mx-auto">
        <header className="mb-16 text-center pt-28">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-gradient-to-r from-blue-950/90 via-black/95 to-blue-950/90 p-8 rounded-lg shadow-lg mb-8"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              Strategic FirmOS Solutions
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Elevate your accounting practice with our meticulously crafted suite of professional tools. Select the optimal FirmOS package to revolutionize your firm&apos;s efficiency, client engagement, and growth potential.
            </p>
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="h-1 bg-gradient-to-r from-blue-950 via-white to-blue-950 rounded-full mx-auto"
          />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="relative h-full"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.03 }}
              onHoverStart={() => setHoveredProduct(product.id)}
              onHoverEnd={() => setHoveredProduct(null)}
            >
              {product.savings && (
                <Badge 
                  className="absolute -top-3 right-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full"
                >
                  {product.savings}% SAVINGS
                </Badge>
              )}
              <Card
                className={`
                  relative h-full bg-black border-gray-800 overflow-hidden
                  transition-all duration-300 ease-in-out flex flex-col cursor-pointer
                  ${selectedProduct === product.id ? 'ring-4 ring-blue-500 shadow-xl shadow-blue-500/50' : ''}
                  ${hoveredProduct === product.id ? 'border-blue-500 border-2' : ''}
                `}
                onClick={() => handleSelectPackage(product.id)}
              >
                <CardHeader className="relative">
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    {product.heading}
                  </CardTitle>
                  <CardDescription>
                    <div className="text-blue-400 font-medium">{product.subtitle}</div>
                    <div className="text-gray-400">{product.description}</div>
                  </CardDescription>
                  {selectedProduct === product.id && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                      Selected
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="flex-1">
                  <div className="text-3xl font-bold text-white mb-6">
                    ${product.price.toLocaleString()}
                    {product.isMonthly && <span className="text-lg text-gray-400">/month</span>}
                  </div>

                  <div className="space-y-2 mb-6">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-start text-gray-300 text-sm">
                        <Check className="mr-2 h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <AnimatePresence>
                    {(hoveredProduct === product.id || selectedProduct === product.id) && (
                      <motion.div 
                        className="mb-6 text-sm text-gray-400"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Info className="inline-block mr-2 text-blue-400" size={16} />
                        {product.fullDescription}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>

                <CardFooter className="mt-auto">
                  <AnimatePresence>
                    {(hoveredProduct === product.id || selectedProduct === product.id) && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="w-full"
                      >
                        <Button 
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectPackage(product.id)
                          }}
                        >
                          Select Package
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          Visit <span className="text-blue-400">www.firmos.ai</span> for more information
          <br />
          Custom AI Workflow Automations for Accounting Firms
        </footer>

        <Dialog open={showPillarModal} onOpenChange={setShowPillarModal}>
          <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Select Your {selectedProduct === '1-pillar' ? 'Pillar' : 'Pillars'}</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                {selectedProduct === '1-pillar' 
                  ? 'Choose one pillar for your FirmOS Growth Platform.'
                  : 'Choose a pillar combination for your FirmOS Business Accelerator.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedProduct === '1-pillar' ? (
                <RadioGroup value={selectedPillar || ''} onValueChange={handlePillarSelection}>
                  {Object.entries(pillars).map(([key, value]) => (
                    <div 
                      key={key} 
                      className={`flex items-start space-x-2 p-3 rounded-md transition-colors
                        ${selectedPillar === key ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      <RadioGroupItem value={key} id={key} className="mt-1" />
                      <div>
                        <Label htmlFor={key} className="font-medium text-lg">{value.name}</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{value.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <RadioGroup value={selectedPillarCombo || ''} onValueChange={handlePillarComboSelection}>
                  {Object.entries(pillarCombos).map(([key, value]) => (
                    <div 
                      key={key} 
                      className={`flex items-start space-x-2 p-3 rounded-md transition-colors
                        ${selectedPillarCombo === key ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                      <RadioGroupItem value={key} id={key} className="mt-1" />
                      <div>
                        <Label htmlFor={key} className="font-medium text-lg">{value.name}</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{value.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
            <DialogFooter>
              <Button 
                onClick={handlePillarConfirmation} 
                disabled={(selectedProduct === '1-pillar' && !selectedPillar) || (selectedProduct === '2-pillars' && !selectedPillarCombo)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              >
                Proceed with {selectedProduct === '1-pillar' ? 'this pillar' : 'these pillars'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
          <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Confirm Your Selection</DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-gray-600 dark:text-gray-400 py-4">
              {confirmationMessage.includes('. ') ? (
                confirmationMessage.split('. ').map((sentence, index) => (
                  <p key={index}>
                    {index === 0 ? (
                      <>
                        You have selected the{' '}
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {sentence.split('the ')[1]?.split('. Would')[0] || sentence}
                        </span>
                        .
                      </>
                    ) : (
                      sentence + '.'
                    )}
                  </p>
                ))
              ) : (
                <p>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {confirmationMessage}
                  </span>
                </p>
              )}
            </DialogDescription>
            <DialogFooter>
              <Button 
                onClick={handleConfirmation}
                className="w-full bg-green-500 hover:bg-green-600 text-white transition-colors"
              >
                Confirm and Proceed
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
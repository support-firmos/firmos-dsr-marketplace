'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import products from '@/content/products.json';
import onePillarChoices from '@/content/onePillarChoices.json';
import twoPillarCombos from '@/content/twoPillarCombos.json';
import contractTemplateIds from '@/content/contractTemplateIds.json';

type SessionData = {
  client?:
    | {
        id?: string;
        object?: string;
        createdAt?: string;
        givenName?: string;
        familyName?: string;
        email?: string;
        companyId?: string;
        status?: string;
        fallbackColor?: string;
        inviteUrl?: string;
        avatarImageUrl?: string;
        firstLoginDate?: string;
        lastLoginDate?: string;
        customFields?: {
          phoneNumber?: string;
          tags?: Array<string>;
        };
        creationMethod?: string;
      }
    | undefined;
  company?:
    | {
        id?: string;
        object?: string;
        createdAt?: string;
        name?: string;
        fallbackColor?: string;
        iconImageUrl?: string;
        isPlaceholder?: boolean;
      }
    | undefined;
};

export function BlockPage({ sessionData }: { sessionData: SessionData }) {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPillarModal, setShowPillarModal] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<string>('');
  const [selectedPillarCombo, setSelectedPillarCombo] = useState<string>('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [loadingText, setLoadingText] = useState('Getting things ready...');
  const [error, setError] = useState<string | null>(null);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [contractUrl, setContractUrl] = useState<string | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState('quarterly');

  const displayName =
    sessionData.client?.givenName || sessionData.company?.name || 'Guest';

  const LOADING_DELAY = 7000; // 7 seconds
  const loadingMessages = [
    'Getting things ready...',
    'Preparing your package...',
    'Almost there!',
  ];

  // Construct the client name
  const clientName = sessionData.client
    ? `${sessionData.client.givenName} ${sessionData.client.familyName}`
    : sessionData.company?.name || 'Unknown Client';

  const handleSelectPackage = (productId: string) => {
    setSelectedProduct(productId);
    if (productId === '1-pillar' || productId === '2-pillars') {
      setShowPillarModal(true);
    } else if (productId === '3-pillars') {
      setConfirmationMessage(
        'You have selected the 3-pillar package, which includes Business Development, Operations, and Talent management. Would you like to proceed?',
      );
      setShowConfirmationModal(true);
    } else if (productId === 'consulting') {
      setConfirmationMessage(
        'You have selected the FirmOS Consulting package. Would you like to proceed?',
      );
      setShowConfirmationModal(true);
    }
  };

  const handlePillarSelection = (pillar: string) => {
    if (selectedProduct === '1-pillar') {
      setSelectedPillar(pillar);
    }
  };

  const handlePillarComboSelection = (combo: string) => {
    setSelectedPillarCombo(combo);
  };

  const handlePillarConfirmation = () => {
    setShowPillarModal(false);
    if (selectedProduct === '1-pillar') {
      setConfirmationMessage(
        `You have selected the ${onePillarChoices[selectedPillar as keyof typeof onePillarChoices].name} pillar. Would you like to proceed?`,
      );
    } else if (selectedProduct === '2-pillars') {
      setConfirmationMessage(
        `You have selected the ${twoPillarCombos[selectedPillarCombo as keyof typeof twoPillarCombos].name} pillars. Would you like to proceed?`,
      );
    }
    setShowConfirmationModal(true);
  };

  const handleConfirmation = async () => {
    setShowConfirmationModal(false);
    setIsLoading(true);
    let currentMessage = 0;
    setLoadingText(loadingMessages[currentMessage]);

    // Determine the contract template ID based on the selected product and billing cycle
    const getContractTemplateId = () => {
      // if (selectedProduct === 'consulting') {
      //   return contractTemplateIds.consulting;
      // }

      const cycle =
        selectedBillingCycle === 'quarterly' ? 'quarterly' : 'monthly';
      const productTemplates = contractTemplateIds[cycle];

      switch (selectedProduct) {
        case '3-pillars':
          return productTemplates['3-pillars'];
        case '2-pillars':
          return productTemplates['2-pillars'][
            selectedPillarCombo as keyof typeof twoPillarCombos
          ];
        case '1-pillar':
          return productTemplates['1-pillar'][
            selectedPillar as keyof typeof onePillarChoices
          ];
        case 'consulting':
          return productTemplates['consulting'];
        default:
          return '';
      }
    };

    const contractTemplateId = getContractTemplateId();

    // Check if we have a valid contractTemplateId
    if (!contractTemplateId) {
      setError('Unable to determine contract template');
      setIsLoading(false);
      return;
    }

    const recipientId = sessionData.client?.id || '';

    const sendContract = async () => {
      const url = '/api/sendContract';
      const payload = {
        recipientId: recipientId.trim(),
        contractTemplateId: contractTemplateId.trim(),
      };

      console.group('📤 Sending contract');
      console.log('Payload:', payload);
      console.groupEnd();

      // Create headers object
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      const apiKey = process.env.NEXT_PUBLIC_COPILOT_API_KEY;
      if (apiKey) {
        headers['X-API-KEY'] = apiKey; // Add the API key only if it exists
      }

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log('📥 API Response:', data);

        if (!response.ok) {
          console.error('❌ Contract API error:', data);
          throw new Error(data.error?.message || 'Unknown error');
        }

        const contractId = data.id;
        const contractUrl = `https://app.firmos.ai/contracts/submit?contractId=${contractId}`;
        setContractUrl(contractUrl); // Save the contract URL to the state for use in the modal

        setShowFinalModal(true); // Show the modal after successfully creating the contract
        setIsLoading(false); // Turn off the loading state
        return contractUrl; // Return the URL if needed elsewhere
      } catch (err) {
        console.error('Error sending contract:', err);
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred',
        );
        setIsLoading(false); // Ensure loading is turned off on error
        throw err;
      }
    };

    try {
      console.time('Contract Creation Duration');
      const contractUrl = await sendContract();
      console.timeEnd('Contract Creation Duration');

      // Process loading messages
      const interval = setInterval(() => {
        currentMessage++;
        if (currentMessage < loadingMessages.length) {
          setLoadingText(loadingMessages[currentMessage]);
        }
        if (currentMessage >= loadingMessages.length) {
          clearInterval(interval);
          setIsLoading(false);
          window.open(contractUrl, '_blank');
        }
      }, LOADING_DELAY / loadingMessages.length);
    } catch (err) {
      console.error('❌ Error during contract creation:', err);
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred',
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Product Selection';
  }, []);

  return (
    <div className="relative min-h-screen p-6 bg-background">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-accent/20 via-background to-accent/20" />
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background bg-opacity-70"
          >
            <div className="relative text-center text-foreground w-80 h-80">
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute inset-0 border-4 rounded-full border-primary"
              />

              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute border-4 rounded-full inset-4 border-foreground"
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
                    ease: 'easeInOut',
                  }}
                  className="w-24 h-6 rounded-sm bg-foreground"
                />
                <motion.div
                  animate={{
                    y: [0, -18, -36, -24, -12, -30, 0],
                  }}
                  transition={{
                    duration: 7,
                    times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1],
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute w-24 h-6 border-2 rounded-sm bg-background border-foreground"
                />
                <motion.div
                  animate={{
                    y: [0, -36, -24, -12, -30, -18, 0],
                  }}
                  transition={{
                    duration: 7,
                    times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1],
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="w-24 h-6 rounded-sm bg-foreground"
                />
              </div>

              <motion.div
                className="absolute w-full transform -translate-x-1/2 -bottom-24 left-1/2"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <p className="text-2xl font-bold text-transparent whitespace-nowrap bg-gradient-to-r from-primary to-accent bg-clip-text">
                  {loadingText}
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <h1
        className="
    bg-muted text-foreground p-2.5 px-5 rounded-md text-lg font-sans 
    shadow-md fixed top-5 left-5 z-[9999] w-auto
  "
      >
        Hello & Welcome,
        <code className="ml-2">{displayName}</code>
      </h1>
      <div className="relative z-10 max-w-7xl mx-auto">
        <header className="mb-8 text-center pt-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="p-8 mx-auto mb-8 rounded-lg shadow-lg"
          >
            <h1 className="mb-4 text-5xl font-medium text-foreground">
              Plans designed for every stage of growth
            </h1>
            <p className="mx-auto text-accent-foreground text-balance">
              Choose from our flexible pricing packages and save more when
              bundling multiple pillars.
            </p>
            <div className="flex w-full justify-center items-center">
              <p className="bg-card mx-auto mt-8 text-accent-foreground text-balance px-4 py-2 rounded-xl">
                Try FirmOS risk-free with our 30-day money-back guarantee.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="h-1 mx-auto rounded-full bg-gradient-to-r from-background via-primary to-background"
          />
        </header>

        <RadioGroup
          defaultValue="quarterly"
          className="flex justify-center space-x-4 pb-8"
          onValueChange={(value) => setSelectedBillingCycle(value)}
        >
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="quarterly" id="quarterly" />
            <Label htmlFor="quarterly">Quarterly</Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="monthly" id="monthly" />
            <Label htmlFor="monthly">Monthly</Label>
          </div>
        </RadioGroup>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="relative h-full"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.03 }}
              onHoverStart={() => setHoveredProduct(product.id)}
              onHoverEnd={() => setHoveredProduct(null)}
            >
              {selectedBillingCycle == 'quarterly' &&
                product.quarterly_savings && (
                  <Badge className="absolute -top-3 right-4 z-10 bg-red-500 text-foreground px-3 py-1 rounded-full">
                    {product.quarterly_savings}% SAVINGS
                  </Badge>
                )}

              {selectedBillingCycle == 'monthly' && product.monthly_savings && (
                <Badge className="absolute -top-3 right-4 z-10 bg-red-500 text-foreground px-3 py-1 rounded-full">
                  {product.monthly_savings}% SAVINGS
                </Badge>
              )}

              <Card
                className={`
                  relative h-full bg-card overflow-hidden
                  transition-all duration-300 ease-in-out flex flex-col cursor-pointer
                  ${selectedProduct === product.id ? 'ring-4 ring-border shadow-xl shadow-secondary/50' : ''}
                  ${hoveredProduct === product.id ? 'border-border border-2' : ''}
                `}
                onClick={() => handleSelectPackage(product.id)}
              >
                <CardHeader className="relative text-center">
                  <CardTitle className="mb-2 text-3xl font-medium flex justify-center items-center text-foreground h-[100%] sm:h-[100%] md:h-[30px] lg:h-[50px] xl:h-[60px]">
                    {product.heading}
                  </CardTitle>

                  <CardDescription>
                    <div className="text-accent-foreground text-xl flex justify-center items-center h-[100%] sm:h-[100%] md:h-[30px] lg:h-[50px] xl:h-[50px]">
                      {product.description}
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="mb-6 text-[2.5rem] font-semibold text-foreground">
                    $
                    {selectedBillingCycle == 'monthly' &&
                      product.price_monthly.toLocaleString()}
                    {selectedBillingCycle == 'quarterly' &&
                      product.price_quarterly.toLocaleString()}
                    {selectedBillingCycle == 'quarterly' &&
                      product.quarterly_savings && <sup>*</sup>}
                    <div className="text-sm mt-2 font-medium text-muted-foreground">
                      per month
                      {selectedBillingCycle == 'quarterly' &&
                        ' (billed quarterly)'}
                    </div>
                  </div>

                  <div className="mb-6 space-y-2">
                    {product.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start text-sm text-accent-foreground"
                      >
                        <Check className="mr-2 h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <AnimatePresence>
                    {(hoveredProduct === product.id ||
                      selectedProduct === product.id) && (
                      <motion.div
                        className="mb-6 text-sm text-muted-foreground"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Info
                          className="inline-block mr-2 text-highlight"
                          size={16}
                        />
                        {product.fullDescription}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>

                <CardFooter className="mt-auto">
                  <AnimatePresence>
                    {(hoveredProduct === product.id ||
                      selectedProduct === product.id) && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="w-full"
                      >
                        <Button
                          className="w-full text-secondary-foreground transition-colors bg-secondary/90 hover:bg-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPackage(product.id);
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

        <footer className="mt-12 text-sm text-center text-muted-foreground">
          Copyright © 2025 FirmOS Inc. All rights reserved
        </footer>

        <Dialog open={showPillarModal} onOpenChange={setShowPillarModal}>
          <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Select {selectedProduct === '1-pillar' ? 'Pillar' : 'Pillars'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {selectedProduct === '1-pillar'
                  ? 'Choose a single pillar to focus on.'
                  : 'Choose a pillar combination to focus on.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedProduct === '1-pillar' ? (
                <RadioGroup
                  value={selectedPillar || ''}
                  onValueChange={handlePillarSelection}
                >
                  {Object.entries(onePillarChoices).map(([key, value]) => (
                    <div
                      key={key}
                      className={`flex items-start space-x-2 p-3 rounded-md transition-colors
                        ${selectedPillar === key ? 'bg-secondary/5' : 'hover:bg-secondary/5'}`}
                    >
                      <RadioGroupItem value={key} id={key} className="mt-1" />
                      <div>
                        <Label
                          htmlFor={key}
                          className="text-lg font-medium cursor-pointer"
                        >
                          {value.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <RadioGroup
                  value={selectedPillarCombo || ''}
                  onValueChange={handlePillarComboSelection}
                >
                  {Object.entries(twoPillarCombos).map(([key, value]) => (
                    <div
                      key={key}
                      className={`flex items-start space-x-2 p-3 rounded-md transition-colors
                        ${selectedPillarCombo === key ? 'bg-secondary/5' : 'hover:bg-secondary/5'}`}
                    >
                      <RadioGroupItem value={key} id={key} className="mt-1" />
                      <div>
                        <Label
                          htmlFor={key}
                          className="cursor-pointer text-lg font-medium"
                        >
                          {value.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={handlePillarConfirmation}
                disabled={
                  (selectedProduct === '1-pillar' && !selectedPillar) ||
                  (selectedProduct === '2-pillars' && !selectedPillarCombo)
                }
                className="w-full text-secondary-foreground transition-colors bg-secondary/90 hover:bg-secondary"
              >
                Activate Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showConfirmationModal}
          onOpenChange={setShowConfirmationModal}
        >
          <DialogContent className="sm:max-w-[425px] bg-card text-card">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Confirm Selection
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="py-4 text-muted-foreground">
              {confirmationMessage.includes('. ') ? (
                confirmationMessage.split('. ').map((sentence, index) => (
                  <p key={index}>
                    {index === 0 ? (
                      <>
                        You have selected the{' '}
                        <span className="font-semibold text-highlight">
                          {
                            sentence
                              .split('the ')[1]
                              ?.split('which includes ')[0]
                          }
                        </span>
                        {sentence.includes('which includes') && (
                          <>
                            {' '}
                            which includes{' '}
                            <span className="font-semibold text-highlight">
                              {
                                sentence
                                  .split('which includes ')[1]
                                  ?.split(' and ')[0]
                              }
                            </span>
                          </>
                        )}
                        {sentence.includes(' and ') && (
                          <>
                            {' '}
                            and{' '}
                            <span className="font-semibold text-highlight">
                              {sentence.split(' and ')[1]?.split('. Would')[0]}
                            </span>
                          </>
                        )}
                        .
                      </>
                    ) : (
                      sentence
                    )}
                  </p>
                ))
              ) : (
                <p>
                  <span className="font-semibold text-highlight">
                    {confirmationMessage}
                  </span>
                </p>
              )}
            </DialogDescription>
            <DialogFooter>
              <Button
                onClick={handleConfirmation}
                className="w-full text-secondary-foreground transition-colors bg-secondary/90 hover:bg-secondary"
              >
                Activate Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showFinalModal} onOpenChange={setShowFinalModal}>
          <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Contract Ready
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-gray-600 dark:text-gray-400 py-4">
              Your contract for purchasing our product is ready for signing.
            </DialogDescription>
            <DialogFooter>
              {contractUrl ? (
                <a
                  href={contractUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-primary hover:bg-primary/900 text-white transition-colors py-2 px-4 text-center rounded-lg inline-block"
                >
                  Go to Contract
                </a>
              ) : (
                <p className="text-gray-400">Loading contract link...</p>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

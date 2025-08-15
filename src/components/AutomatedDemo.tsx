
'use client'

import * as React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { demoData, type DemoMode } from '@/lib/demo-data'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { Badge } from './ui/badge'
import { TypingEffect } from './TypingEffect'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function AutomatedDemo() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [currentMode, setCurrentMode] = React.useState<DemoMode>(demoData[0])
  
  const router = useRouter();

  const plugin = React.useRef(
    Autoplay({ delay: 6000, stopOnInteraction: true, stopOnMouseEnter: true })
  )

  React.useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap())

    const handleSelect = (api: CarouselApi) => {
      const selectedIndex = api.selectedScrollSnap();
      setCurrent(selectedIndex);
      setCurrentMode(demoData[selectedIndex]);
    };

    api.on('select', handleSelect)

    return () => {
      api.off('select', handleSelect)
    }
  }, [api])

  const handleTryThis = (link: string) => {
    router.push(link);
  };

  return (
    <div>
      <Carousel
        setApi={setApi}
        className="w-full"
        plugins={[plugin.current]}
      >
        <CarouselContent>
          {demoData.map((mode, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card className="overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="font-headline text-xl flex items-center gap-3">
                           <mode.icon className="h-5 w-5 text-primary"/>
                           {mode.mode}
                        </CardTitle>
                    </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 items-stretch">
                    {/* Input Side */}
                    <div className="flex flex-col">
                      <Badge variant="secondary" className="self-start mb-2">Sample Input</Badge>
                      <Card className="flex-grow bg-muted/50">
                        <CardContent className="p-4">
                          <AnimatePresence mode="wait">
                            {current === index && (
                                <motion.div
                                    key={`input-${index}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <TypingEffect text={mode.sampleInput} />
                                </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Output Side */}
                     <div className="flex flex-col">
                      <Badge className="self-start mb-2">AI Generated Output</Badge>
                      <Card className="flex-grow">
                        <CardContent className="p-4">
                          <AnimatePresence mode="wait">
                             {current === index && (
                                <motion.div
                                    key={`output-${index}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                    className="text-sm text-muted-foreground whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: mode.sampleOutput }}
                                >
                                </motion.div>
                             )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
      <div className="py-4 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-4">
             {demoData.map((_, index) => (
                <button
                    key={index}
                    onClick={() => api?.scrollTo(index)}
                    className={cn(
                        "h-2 w-2 rounded-full transition-all",
                        current === index ? 'w-4 bg-primary' : 'bg-muted-foreground/30'
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                />
            ))}
        </div>
        <AnimatePresence mode="wait">
            <motion.div
                 key={`button-${current}`}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.3 }}
            >
                <Button onClick={() => handleTryThis(currentMode.tryThisLink)}>
                    Try This Example
                </Button>
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Star, Crown, Zap, AlertCircle, Calendar, CreditCard } from 'lucide-react'
import { School, SubscriptionPlan } from '@prisma/client'

interface Plan {
  id: SubscriptionPlan
  name: string
  price: number
  duration: string
  description: string
  positioning: string
  features: string[]
  popular?: boolean
  color: string
  icon: any
}

const plans: Plan[] = [
  {
    id: 'BASIC',
    name: 'BASIC',
    price: 2999,
    duration: '/ year',
    description: 'For small & govt schools',
    positioning: 'Website ban bhi jayega aur chalate rehne ka tension bhi nahi',
    features: [
      'School website',
      'Hosting + SSL',
      'Notice Board',
      'Photo Gallery',
      'Mobile-friendly',
      'Free subdomain'
    ],
    color: 'bg-green-500',
    icon: CheckCircle
  },
  {
    id: 'STANDARD',
    name: 'STANDARD',
    price: 6999,
    duration: '/ year',
    description: 'For private schools',
    positioning: 'Admissions aur parent enquiries ke liye best plan',
    popular: true,
    features: [
      'Everything in Basic',
      'Custom domain (.in / .com)',
      'Admission enquiry form',
      'WhatsApp button',
      'Google Map',
      'Priority support'
    ],
    color: 'bg-blue-500',
    icon: Star
  },
  {
    id: 'PREMIUM',
    name: 'PREMIUM',
    price: 9999,
    duration: '/ year',
    description: 'For growth-focused schools',
    positioning: 'Complete digital system for school communication',
    features: [
      'Everything in Standard',
      'WhatsApp notice broadcast',
      'Online fee payment page',
      'Results upload module',
      'Monthly content update',
      'Backup & restore priority'
    ],
    color: 'bg-red-500',
    icon: Crown
  }
]

interface SubscriptionManagerProps {
  school: School
  onSubscriptionChange: () => void
}

export default function SubscriptionManager({ school, onSubscriptionChange }: SubscriptionManagerProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(school.plan || 'FREE')
  const [loading, setLoading] = useState(false)
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  const currentPlan = plans.find(p => p.id === school.plan)
  const daysLeft = school.subscriptionEnds ? Math.ceil((new Date(school.subscriptionEnds).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setRazorpayLoaded(true)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!razorpayLoaded) {
      alert('Payment system is loading. Please wait...')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })

      if (response.ok) {
        const { orderId, amount } = await response.json()
        
        // Initialize Razorpay payment
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXX',
          amount: amount * 100, // Convert to paise
          currency: 'INR',
          name: 'VidyaWebBuilder',
          description: `${plan} Plan Subscription`,
          order_id: orderId,
          handler: async function (response: any) {
            // Verify payment
            const verifyResponse = await fetch('/api/subscriptions/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan
              })
            })

            if (verifyResponse.ok) {
              onSubscriptionChange()
            } else {
              alert('Payment verification failed. Please contact support.')
            }
          },
          prefill: {
            name: school.name,
            email: school.email || '',
          },
          theme: {
            color: '#2563eb'
          },
          modal: {
            ondismiss: function() {
              setLoading(false)
            }
          }
        }

        const razorpay = new (window as any).Razorpay(options)
        razorpay.open()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create subscription order')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert('Failed to process subscription. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      {school.plan !== 'FREE' && currentPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <currentPlan.icon className={`h-5 w-5 text-white p-1 rounded ${currentPlan.color}`} />
              Current Plan: {currentPlan.name}
            </CardTitle>
            <CardDescription>
              {school.subscriptionEnds && daysLeft > 0 ? (
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Valid for {daysLeft} more days
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Expired
                </span>
              )}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Pricing Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon
          const isCurrentPlan = school.plan === plan.id
          const isExpired = school.subscriptionEnds && new Date(school.subscriptionEnds) < new Date()

          return (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''} ${
                isCurrentPlan && !isExpired ? 'ring-2 ring-green-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    MOST POPULAR
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  <div className={`p-3 rounded-full ${plan.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ₹{plan.price.toLocaleString('en-IN')}
                  <span className="text-sm font-normal text-muted-foreground">{plan.duration}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Positioning Line */}
                <div className="text-center text-sm font-medium text-blue-600 bg-blue-50 p-2 rounded">
                  {plan.positioning}
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button 
                  className={`w-full ${plan.popular ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                  variant={isCurrentPlan && !isExpired ? "outline" : "default"}
                  disabled={loading || (isCurrentPlan && !isExpired)}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Processing...
                    </span>
                  ) : isCurrentPlan && !isExpired ? (
                    'Current Plan'
                  ) : isCurrentPlan && isExpired ? (
                    'Renew Plan'
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>Compare all plans and choose the best for your school</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Feature</th>
                  <th className="text-center p-2">Basic</th>
                  <th className="text-center p-2">Standard</th>
                  <th className="text-center p-2">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2">School Website</td>
                  <td className="text-center p-2">✓</td>
                  <td className="text-center p-2">✓</td>
                  <td className="text-center p-2">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Hosting & SSL</td>
                  <td className="text-center p-2">✓</td>
                  <td className="text-center p-2">✓</td>
                  <td className="text-center p-2">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Free Subdomain</td>
                  <td className="text-center p-2">✓</td>
                  <td className="text-center p-2">✓</td>
                  <td className="text-center p-2">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Custom Domain</td>
                  <td className="text-center p-2">✗</td>
                  <td className="text-center p-2">✓</td>
                  <td className="text-center p-2">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Admission Form</td>
                  <td className="text-center p-2">✗</td>
                  <td className="text-center p-2">✓</td>
                  <td className="text-center p-2">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">WhatsApp Integration</td>
                  <td className="text-center p-2">✗</td>
                  <td className="text-center p-2">Button</td>
                  <td className="text-center p-2">Broadcast</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Online Fee Payment</td>
                  <td className="text-center p-2">✗</td>
                  <td className="text-center p-2">✗</td>
                  <td className="text-center p-2">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Results Upload</td>
                  <td className="text-center p-2">✗</td>
                  <td className="text-center p-2">✗</td>
                  <td className="text-center p-2">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Priority Support</td>
                  <td className="text-center p-2">✗</td>
                  <td className="text-center p-2">✓</td>
                  <td className="text-center p-2">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
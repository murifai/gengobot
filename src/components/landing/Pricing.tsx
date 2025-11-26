import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const pricingPlans = [
  {
    name: 'Lorem',
    price: '$19',
    description: 'Consectetur adipiscing elit sed do eiusmod',
    features: [
      'Lorem ipsum dolor sit',
      'Consectetur adipiscing elit',
      'Sed do eiusmod tempor',
      'Incididunt ut labore',
      'Dolore magna aliqua',
    ],
    cta: 'Commodi Labore',
    popular: false,
  },
  {
    name: 'Ipsum',
    price: '$29',
    description: 'Ut enim ad minim veniam quis nostrud',
    features: [
      'Lorem ipsum dolor sit',
      'Consectetur adipiscing elit',
      'Sed do eiusmod tempor',
      'Incididunt ut labore',
      'Dolore magna aliqua',
      'Ut enim ad minim',
      'Quis nostrud exercitation',
      'Ullamco laboris nisi',
    ],
    cta: 'Magna Tempor',
    popular: true,
  },
  {
    name: 'Dolor',
    price: '$49',
    description: 'Excepteur sint occaecat cupidatat non',
    features: [
      'Lorem ipsum dolor sit',
      'Consectetur adipiscing elit',
      'Sed do eiusmod tempor',
      'Incididunt ut labore',
      'Dolore magna aliqua',
      'Ut enim ad minim',
      'Quis nostrud exercitation',
      'Ullamco laboris nisi',
      'Duis aute irure dolor',
      'Reprehenderit voluptate',
    ],
    cta: 'Exercitation Elit',
    popular: false,
  },
];

export function Pricing() {
  return (
    <section className="container mx-auto px-6 py-20" id="pricing">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Lorem Ipsum Dolor Sit
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {pricingPlans.map((plan, index) => (
          <Card
            key={index}
            className={`relative hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all ${
              plan.popular ? 'border-primary scale-105' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge variant="danger" className="bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <CardDescription className="mt-4">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className="mb-6" />
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${
                  plan.popular
                    ? 'bg-primary hover:opacity-90'
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
                size="lg"
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

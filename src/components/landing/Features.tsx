import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Target, Zap, TrendingUp, Users, Clock, Shield } from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Lorem Ipsum Dolor',
    description:
      'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
  {
    icon: Zap,
    title: 'Sed Do Eiusmod',
    description:
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea.',
  },
  {
    icon: TrendingUp,
    title: 'Tempor Incididunt',
    description:
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.',
  },
  {
    icon: Users,
    title: 'Consectetur Adipiscing',
    description:
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit.',
  },
  {
    icon: Clock,
    title: 'Magna Aliqua',
    description:
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.',
  },
  {
    icon: Shield,
    title: 'Ullamco Laboris',
    description:
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque.',
  },
];

export function Features() {
  return (
    <section className="container mx-auto px-6 py-20" id="features">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Lorem Ipsum Dolor Sit Amet
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card
              key={index}
              className="hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-base border-2 border-border bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-16 rounded-base bg-muted border-2 border-border mb-4" />
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

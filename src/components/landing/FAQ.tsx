'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion';

const faqs = [
  {
    question: 'Lorem ipsum dolor sit amet consectetur?',
    answer:
      'Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  },
  {
    question: 'Sed do eiusmod tempor incididunt ut labore?',
    answer:
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.',
  },
  {
    question: 'Consectetur adipiscing elit magna aliqua?',
    answer:
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.',
  },
  {
    question: 'Quis nostrud exercitation ullamco laboris?',
    answer:
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore.',
  },
  {
    question: 'Excepteur sint occaecat cupidatat non?',
    answer:
      'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
  },
  {
    question: 'Ut enim ad minim veniam quis nostrud?',
    answer:
      'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt.',
  },
];

export function FAQ() {
  return (
    <section className="container mx-auto px-6 py-20" id="faq">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
          Lorem Ipsum Dolor Sit
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore.
        </p>
      </div>

      <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-4">
        {faqs.map((faq, index) => (
          <Accordion key={index} type="single" collapsible className="w-full">
            <AccordionItem
              value={`item-${index}`}
              className="bg-accent/50 rounded-lg px-4 border-border"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-medium text-foreground">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </section>
  );
}

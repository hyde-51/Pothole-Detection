import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How accurate is the AI detection pipeline?",
      answer: "Our system deploys a AI architecture using Weighted Box Fusion (WBF). By combining YOLOv8 for rapid edge-detection and Faster R-CNN for spatial precision, it drastically reduces false positives compared to single-model systems."
    },
    {
      question: "What image formats are supported?",
      answer: "The platform supports high-resolution JPG, JPEG, PNG, and WEBP files (up to 10MB). For automated geospatial tagging, ensure your camera's 'Location Tags' feature is enabled and avoid sending images via compression apps like WhatsApp."
    },
    {
      question: "How is the material cost estimated?",
      answer: "The proprietary algorithm calculates the physical surface area of the bounding box relative to the camera distance. It then applies standard civil engineering depths based on severity to output the exact kilograms of bitumen required."
    },
    {
      question: "Does the system work if GPS data is stripped?",
      answer: "Yes. If an image is sent via platforms that scrub EXIF data for privacy, the visual detection and material calculation will still function perfectly. The system will gracefully notify you that telemetry mapping is unavailable."
    }
  ];

  return (
    <section className="px-6 py-24 bg-primary transition-colors duration-300">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-content mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted font-medium">
            Everything you need to know about the Next-Gen Analytics engine.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className="bg-secondary border border-borderline rounded-xl overflow-hidden transition-all duration-300 hover:border-accent/50"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                >
                  <span className={`font-bold text-lg transition-colors ${isOpen ? 'text-accent' : 'text-content'}`}>
                    {faq.question}
                  </span>
                  <div className={`p-1 rounded-full border transition-all duration-300 ${isOpen ? 'bg-accent/10 border-accent text-accent rotate-180' : 'border-borderline text-muted bg-primary'}`}>
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                  </div>
                </button>

                <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-6 pt-0 text-muted leading-relaxed font-medium">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
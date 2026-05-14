import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Ahmed Hassan",
      location: "United Kingdom",
      text: "Sheikh Assim's lectures have been a guiding light in my journey of learning Islam. His clear explanations and authentic approach make complex topics easy to understand.",
      rating: 5,
    },
    {
      id: 2,
      name: "Fatima Rahman",
      location: "United States",
      text: "The counseling session with Sheikh Assim was life-changing. His wisdom and compassion helped me navigate through a difficult time in my marriage.",
      rating: 5,
    },
    {
      id: 3,
      name: "Omar Farooq",
      location: "Canada",
      text: "I've been following Sheikh Assim's Q&A sessions for years. His answers are always grounded in authentic sources and practical wisdom. Truly a blessing for the Ummah.",
      rating: 5,
    },
    {
      id: 4,
      name: "Aisha Malik",
      location: "Australia",
      text: "The books by Sheikh Assim are a treasure trove of Islamic knowledge. They're well-researched and presented in an easy-to-understand manner. Highly recommended!",
      rating: 5,
    },
  ];

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#1a1f2e]/5 via-white to-[#10b981]/5">
      <div className="container max-w-[1260px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10"
        >
          <span className="text-[#10b981] font-semibold uppercase tracking-wider text-xs sm:text-sm">Testimonials</span>
          <h2 className="section-title text-[#1a1f2e] mt-1 sm:mt-2 mb-2 sm:mb-3">What People Say</h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
            Hear from those who have benefited from Sheikh Assim's guidance and teachings
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto px-2 sm:px-4">
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-lg sm:shadow-xl">
            <div className="relative min-h-[350px] xs:min-h-[300px] sm:min-h-[300px] lg:min-h-[280px]">
              <AnimatePresence mode="sync" custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.3 }}
                  className="absolute inset-0 p-9  md:p-12 lg:p-6 flex flex-col justify-center"
                >
                  <Quote size={32} className="sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#10b981]/20 mb-3 sm:mb-4" />
                  <p className="text-sm xs:text-base sm:text-lg lg:text-xl text-gray-700 mb-4 sm:mb-6 leading-relaxed italic">
                    "{testimonials[currentIndex].text}"
                  </p>
                  <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3">
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-[#1a1f2e]">
                        {testimonials[currentIndex].name}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500">{testimonials[currentIndex].location}</p>
                    </div>
                    <div className="flex gap-0.5 sm:gap-1">
                      {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                        <Star key={i} size={16} className="sm:w-[18px] sm:h-[18px] text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 lg:-left-4 xl:-left-4 top-1/2 -translate-y-1/2 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white rounded-full shadow-md sm:shadow-lg flex items-center justify-center hover:bg-[#10b981] hover:text-white focus:outline-none focus:!bg-white focus:text-[#1a1f2e] transition-all duration-300 border border-gray-100"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={18} className="xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 lg:-right-4 xl:-right-4 top-1/2 -translate-y-1/2 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white rounded-full shadow-md sm:shadow-lg flex items-center justify-center hover:bg-[#10b981] hover:text-white focus:outline-none focus:!bg-white focus:text-[#1a1f2e] transition-all duration-300 border border-gray-100"
            aria-label="Next testimonial"
          >
            <ChevronRight size={18} className="xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 sm:gap-2 mt-5 sm:mt-6">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full focus:outline-none transition-all duration-300 ${
                  idx === currentIndex 
                    ? "w-6 sm:w-8 bg-[#10b981] focus:!bg-[#10b981]" 
                    : "w-2 bg-gray-300 hover:bg-gray-400 focus:!bg-gray-300"
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
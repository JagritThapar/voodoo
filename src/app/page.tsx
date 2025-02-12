import React from "react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <motion.section
        className="h-screen flex flex-col items-center justify-center text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-6xl font-bold">Welcome to Our Games</h1>
        <p className="text-lg mt-4 max-w-2xl">
          Creating amazing mobile games for millions of players worldwide.
        </p>
      </motion.section>

      {/* Games Portfolio */}
      <section className="py-16 px-8">
        <h2 className="text-4xl font-bold text-center mb-8">Our Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Example game cards */}
          {["Game 1", "Game 2", "Game 3"].map((game, index) => (
            <motion.div
              key={index}
              className="bg-gray-800 p-6 rounded-lg text-center"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="text-2xl font-semibold">{game}</h3>
              <p className="mt-2">An exciting adventure awaits!</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Careers Section */}
      <section className="py-16 px-8 bg-gray-900">
        <h2 className="text-4xl font-bold text-center mb-8">Join Our Team</h2>
        <p className="text-center max-w-xl mx-auto">
          We are always looking for talented individuals to join our growing team.
        </p>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-8">
        <h2 className="text-4xl font-bold text-center mb-8">Contact Us</h2>
        <form className="max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-3 mb-4 bg-gray-800 text-white rounded"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full p-3 mb-4 bg-gray-800 text-white rounded"
          />
          <textarea
            placeholder="Your Message"
            className="w-full p-3 mb-4 bg-gray-800 text-white rounded h-32"
          ></textarea>
          <button className="w-full p-3 bg-red-600 hover:bg-red-700 rounded">
            Send Message
          </button>
        </form>
      </section>
    </div>
  );
}

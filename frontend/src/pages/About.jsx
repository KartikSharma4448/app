import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div>
      <Navbar />
      
      <section className="section" data-testid="about-section">
        <h1 className="section-title" data-testid="about-title">About Anukriti Prakashan</h1>
        
        <div style={{ maxWidth: '900px', margin: '0 auto', lineHeight: '1.8' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', textAlign: 'justify' }} data-testid="about-description">
            Anukriti Prakashan, established in 2005, is a distinguished publishing house based in Jaipur, Rajasthan. 
            Founded by Dr. Jayshree Sharma and directed by Mr. Babu Khanda, the publication has been dedicated to 
            promoting Hindi literature and nurturing creative expression for over two decades.
          </p>
          
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', textAlign: 'justify' }}>
            We specialize in publishing and distributing a wide range of literary works, including magazines, stories, 
            poems, novels, essays, autobiographies, criticism, and travelogues. Our publications reflect the rich 
            cultural heritage of Hindi literature while encouraging contemporary voices that inspire readers across generations.
          </p>

          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '12px', 
            marginTop: '3rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#8B1538', marginBottom: '1.5rem', fontSize: '1.8rem' }}>Our Details</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <p data-testid="about-address"><strong>Address:</strong> 14/H/94, Indira Gandhi Nagar, Jaipur, Rajasthan</p>
              <p data-testid="about-established"><strong>Established:</strong> 2005</p>
              <p data-testid="about-owner"><strong>Owner:</strong> Dr. Jayshree Sharma</p>
              <p data-testid="about-director"><strong>Director:</strong> Babu Khanda</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
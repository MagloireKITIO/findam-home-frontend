// src/pages/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiCalendar, FiUsers } from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import PropertyCard from '../components/features/PropertyCard';
import SectionTitle from '../components/common/SectionTitle';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LandingPage = () => {
  const navigate = useNavigate();
  const [popularProperties, setPopularProperties] = useState([]);
  const [featuredCities, setFeaturedCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // État pour la recherche
  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
  });

  // Récupérer les propriétés populaires
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les propriétés populaires (les mieux notées)
        const propertiesResponse = await api.get('/properties/', {
          params: {
            ordering: '-avg_rating',
            limit: 6,
          }
        });
        
        // Récupérer les villes avec des propriétés
        const citiesResponse = await api.get('/properties/cities/');
        
        setPopularProperties(propertiesResponse.data.results || []);
        setFeaturedCities(citiesResponse.data || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError('Une erreur est survenue lors du chargement des données.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Gérer les changements dans le formulaire de recherche
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  // Soumettre la recherche
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    // Construire les paramètres de requête pour la redirection
    const queryParams = new URLSearchParams();
    
    if (searchParams.location) {
      queryParams.append('location', searchParams.location);
    }
    
    if (searchParams.checkIn) {
      queryParams.append('check_in_date', searchParams.checkIn);
    }
    
    if (searchParams.checkOut) {
      queryParams.append('check_out_date', searchParams.checkOut);
    }
    
    if (searchParams.guests > 1) {
      queryParams.append('guests_count', searchParams.guests);
    }
    
    // Rediriger vers la page de recherche avec les paramètres
    navigate(`/properties?${queryParams.toString()}`);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-40"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Trouvez votre logement idéal au Cameroun
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Des milliers de logements meublés pour vos séjours courts, moyens ou longs terme.
            </p>
          </motion.div>
          
          {/* Formulaire de recherche */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-4 md:p-6 max-w-4xl mx-auto text-gray-700"
          >
            <form onSubmit={handleSearchSubmit} className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMapPin className="text-gray-500" />
                </div>
                <input
                  type="text"
                  name="location"
                  value={searchParams.location}
                  onChange={handleSearchChange}
                  placeholder="Destination"
                  className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-500" />
                </div>
                <input
                  type="date"
                  name="checkIn"
                  value={searchParams.checkIn}
                  onChange={handleSearchChange}
                  className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-500" />
                </div>
                <input
                  type="date"
                  name="checkOut"
                  value={searchParams.checkOut}
                  onChange={handleSearchChange}
                  className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="md:flex md:items-center md:space-x-4">
                <div className="relative flex-grow mb-4 md:mb-0">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUsers className="text-gray-500" />
                  </div>
                  <select
                    name="guests"
                    value={searchParams.guests}
                    onChange={handleSearchChange}
                    className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'voyageur' : 'voyageurs'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  className="px-6 py-3"
                  icon={<FiSearch />}
                >
                  Rechercher
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Section des propriétés populaires */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionTitle 
            title="Logements populaires" 
            subtitle="Découvrez nos hébergements les mieux notés par nos clients"
          />
          
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularProperties.length > 0 ? (
                popularProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-8">
                  Aucun logement disponible pour le moment.
                </div>
              )}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link to="/properties">
              <Button variant="outline" icon={<FiSearch />} iconPosition="right">
                Voir tous les logements
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section des villes */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <SectionTitle 
            title="Destinations populaires" 
            subtitle="Explorez nos principales destinations au Cameroun"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(featuredCities) && featuredCities.length > 0 ? (
              featuredCities.slice(0, 6).map((city) => (
                <Link to={`/properties?city=${city.id}`} key={city.id}>
                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    className="relative rounded-xl overflow-hidden h-64 shadow-lg group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-70"></div>
                    <img 
                      src={`https://source.unsplash.com/featured/600x400?${city.name},city`} 
                      alt={city.name} 
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                      <h3 className="text-2xl font-bold">{city.name}</h3>
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
              // Afficher des villes par défaut si l'API ne renvoie pas de données valides
              ['Douala', 'Yaoundé', 'Kribi', 'Limbé', 'Bafoussam', 'Garoua'].map((cityName, index) => (
                <Link to={`/properties?city_name=${cityName}`} key={index}>
                  <motion.div 
                    whileHover={{ scale: 1.03 }}
                    className="relative rounded-xl overflow-hidden h-64 shadow-lg group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-70"></div>
                    <img 
                      src={`https://source.unsplash.com/featured/600x400?${cityName},city`} 
                      alt={cityName} 
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                      <h3 className="text-2xl font-bold">{cityName}</h3>
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Section avantages */}
      <section className="py-16 bg-primary-50">
        <div className="container mx-auto px-4">
          <SectionTitle 
            title="Pourquoi choisir FINDAM ?" 
            subtitle="Notre plateforme offre de nombreux avantages pour les voyageurs et les propriétaires"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {[
              {
                title: 'Réservations sécurisées',
                description: 'Système de paiement sécurisé avec Mobile Money et une réservation simple et transparente.',
                icon: '🔒'
              },
              {
                title: 'Vérification d\'identité',
                description: 'Tous nos utilisateurs sont vérifiés pour assurer votre sécurité et votre tranquillité.',
                icon: '✅'
              },
              {
                title: 'Support local',
                description: 'Une équipe locale disponible pour vous accompagner tout au long de votre expérience.',
                icon: '🇨🇲'
              },
              {
                title: 'Codes promo',
                description: 'Profitez de promotions exclusives et de réductions négociées directement avec les propriétaires.',
                icon: '🎁'
              },
              {
                title: 'Paiements flexibles',
                description: 'Options de paiement adaptées au contexte local et aux préférences des utilisateurs.',
                icon: '💳'
              },
              {
                title: 'Messagerie intégrée',
                description: 'Communiquez facilement avec les propriétaires ou les locataires via notre plateforme.',
                icon: '💬'
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à trouver votre logement idéal ?
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Que vous soyez en voyage d'affaires, en vacances ou à la recherche d'un logement longue durée, 
              FINDAM vous accompagne dans vos recherches.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/properties">
                <Button 
                  variant="primary" 
                  className="bg-white text-primary-600 hover:bg-gray-100"
                >
                  Explorer les logements
                </Button>
              </Link>
              <Link to="/register?type=owner">
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary-600"
                >
                  Devenir propriétaire
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <SectionTitle 
            title="Ce que disent nos utilisateurs" 
            subtitle="Découvrez l'expérience vécue par notre communauté"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {[
              {
                name: 'Sophie Nguema',
                role: 'Locataire',
                content: 'J\'ai trouvé un appartement fantastique à Yaoundé pour mon séjour professionnel. Le processus était si simple et le propriétaire était très accueillant. Je recommande vivement FINDAM !',
                image: 'https://randomuser.me/api/portraits/women/44.jpg',
              },
              {
                name: 'Paul Essomba',
                role: 'Propriétaire',
                content: 'En tant que propriétaire, FINDAM m\'a permis de trouver des locataires sérieux et de gérer facilement mes réservations. Le système de paiement sécurisé m\'a vraiment facilité la vie.',
                image: 'https://randomuser.me/api/portraits/men/86.jpg',
              },
              {
                name: 'Carole Dibango',
                role: 'Locataire',
                content: 'J\'ai utilisé FINDAM pour trouver un logement lors de mon voyage à Douala. L\'équipe a été très réactive et m\'a aidée à trouver le logement parfait en fonction de mes besoins.',
                image: 'https://randomuser.me/api/portraits/women/29.jpg',
              },
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 p-6 rounded-lg"
              >
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">{testimonial.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <SectionTitle 
            title="Questions fréquentes" 
            subtitle="Vous avez des questions ? Nous avons les réponses."
          />
          
          <div className="max-w-3xl mx-auto mt-8 space-y-6">
            {[
              {
                question: 'Comment fonctionne le processus de réservation ?',
                answer: 'Pour réserver un logement, sélectionnez les dates souhaitées, complétez les informations nécessaires et effectuez le paiement. Une fois la réservation confirmée par le propriétaire, vous recevrez les détails pour votre séjour.'
              },
              {
                question: 'Quels sont les modes de paiement acceptés ?',
                answer: 'Nous acceptons les paiements par Mobile Money (Orange Money, MTN Mobile Money), cartes bancaires et virements bancaires selon les options disponibles dans votre région.'
              },
              {
                question: 'Comment devenir propriétaire sur FINDAM ?',
                answer: 'Pour devenir propriétaire, inscrivez-vous, complétez votre profil et vérifiez votre identité. Vous pourrez ensuite ajouter vos logements avec photos et détails complets, puis choisir un abonnement adapté à vos besoins.'
              },
              {
                question: 'Que faire en cas de problème pendant mon séjour ?',
                answer: 'En cas de problème, contactez directement le propriétaire via notre messagerie intégrée. Si le problème persiste, notre équipe de support est disponible pour vous aider à résoudre la situation.'
              },
              {
                question: 'Comment fonctionne le système de codes promo ?',
                answer: 'Les propriétaires peuvent créer des codes promo personnalisés pour offrir des réductions aux locataires. Ces codes peuvent être appliqués lors du processus de réservation pour obtenir une remise sur le prix total.'
              }
            ].map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <details className="group">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-medium text-gray-900">
                    {faq.question}
                    <span className="transition-transform duration-300 group-open:rotate-180">
                      ⌄
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-gray-700">
                    {faq.answer}
                  </div>
                </details>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link to="/faq">
              <Button variant="secondary">
                Voir toutes les questions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LandingPage;
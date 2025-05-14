// src/pages/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiCalendar, FiUsers, FiStar, FiShield, FiHeart, FiArrowRight } from 'react-icons/fi';
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
        const propertiesResponse = await api.get('/properties/properties/', {
          params: {
            ordering: '-avg_rating',
            limit: 6,
            is_published: true,
            is_verified: true
          }
        });
        const citiesResponse = await api.get('/properties/cities/');
        // Récupérer les villes avec des propriétés
        const properties = propertiesResponse.data.results || propertiesResponse.data || [];
        const cities = citiesResponse.data.results || citiesResponse.data || [];
        
        console.log('URL de la requête:', propertiesResponse.request?.responseURL);
        console.log('Propriétés récupérées:', properties); 
        console.log('Nombre de propriétés:', properties.length);
        console.log('Status des propriétés:', properties.map(p => ({
          id: p.id,
          title: p.title,
          is_published: p.is_published,
          is_verified: p.is_verified
        })));

        setPopularProperties(properties);
        setFeaturedCities(cities);
        
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
      {/* Hero Section Moderne */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-primary-600 via-primary-700 to-purple-800 text-white overflow-hidden">
        {/* Formes géométriques flottantes */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              y: [0, -30, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 8,
              ease: "easeInOut"
            }}
            className="absolute top-20 right-10 w-32 h-32 bg-white/5 rounded-3xl backdrop-blur-sm"
          />
          <motion.div
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -3, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 6,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-32 left-16 w-24 h-24 bg-amber-400/10 rounded-2xl backdrop-blur-sm"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 10, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 10,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute top-1/3 left-1/4 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full backdrop-blur-sm"
          />
        </div>

        {/* Effet de particules subtiles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              animate={{
                y: [0, -100],
                opacity: [0, 1, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 5,
                ease: "easeOut"
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: '100%'
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex items-center space-x-2 text-amber-300"
                >
                  <FiStar className="fill-current" />
                  <span className="text-sm font-medium">Plus de 1000+ logements vérifiés</span>
                </motion.div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Trouvez votre
                  <span className="block bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                    logement idéal
                  </span>
                  au Cameroun
                </h1>
                
                <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
                  Des milliers de logements meublés pour vos séjours courts, moyens ou longs terme.
                  <span className="block mt-2 text-lg text-blue-200">Découvrez une nouvelle façon de voyager.</span>
                </p>
              </div>
              
              {/* Stats rapides */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex space-x-8"
              >
                {[
                  { label: 'Logements', value: '1000+' },
                  { label: 'Villes', value: '15+' },
                  { label: 'Avis positifs', value: '98%' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-amber-300">{stat.value}</div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
            
            {/* Formulaire de recherche moderne */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:ml-8"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Commencer votre recherche
                </h3>
                
                <form onSubmit={handleSearchSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Destination</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiMapPin className="text-primary-500" />
                        </div>
                        <input
                          type="text"
                          name="location"
                          value={searchParams.location}
                          onChange={handleSearchChange}
                          placeholder="Où souhaitez-vous aller ?"
                          className="pl-12 w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Voyageurs</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiUsers className="text-primary-500" />
                        </div>
                        <select
                          name="guests"
                          value={searchParams.guests}
                          onChange={handleSearchChange}
                          className="pl-12 w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none bg-white"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <option key={num} value={num}>
                              {num} {num === 1 ? 'voyageur' : 'voyageurs'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Arrivée</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiCalendar className="text-primary-500" />
                        </div>
                        <input
                          type="date"
                          name="checkIn"
                          value={searchParams.checkIn}
                          onChange={handleSearchChange}
                          className="pl-12 w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Départ</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiCalendar className="text-primary-500" />
                        </div>
                        <input
                          type="date"
                          name="checkOut"
                          value={searchParams.checkOut}
                          onChange={handleSearchChange}
                          className="pl-12 w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 group"
                  >
                    <FiSearch className="group-hover:rotate-12 transition-transform" />
                    <span>Rechercher maintenant</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section des propriétés populaires avec design moderne */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <FiStar className="fill-current" />
              <span>Les plus appréciés</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Logements populaires
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez nos hébergements les mieux notés par nos clients
            </p>
          </motion.div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center bg-red-50 text-red-600 py-8 rounded-2xl"
            >
              {error}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {popularProperties.length > 0 ? (
                popularProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <PropertyCard property={property} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-8">
                  <div className="text-6xl mb-4">🏠</div>
                  <p className="text-lg">Aucun logement disponible pour le moment.</p>
                </div>
              )}
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-16"
          >
            <Link to="/properties">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white border-2 border-primary-200 text-primary-600 px-8 py-4 rounded-full font-semibold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto group"
              >
                <span>Voir tous les logements</span>
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Section des villes avec design moderne */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <FiMapPin className="fill-current" />
              <span>Explorez le Cameroun</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Destinations populaires
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explorez nos principales destinations au Cameroun
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.isArray(featuredCities) && featuredCities.length > 0 ? (
              featuredCities.slice(0, 6).map((city, index) => (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link to={`/properties?city=${city.id}`}>
                    <motion.div 
                      whileHover={{ y: -8 }}
                      className="relative rounded-3xl overflow-hidden h-80 shadow-xl group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                      <motion.img 
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        src={`https://source.unsplash.com/featured/600x400?${city.name},city`} 
                        alt={city.name} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 p-8 text-white z-20">
                        <h3 className="text-3xl font-bold mb-2">{city.name}</h3>
                        <p className="text-blue-200">Découvrir</p>
                      </div>
                      
                      {/* Effet hover moderne */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-t from-primary-600/90 to-transparent z-15 flex items-end p-8"
                      >
                        <motion.div
                          initial={{ y: 20 }}
                          whileHover={{ y: 0 }}
                          className="text-white"
                        >
                          <p className="text-lg mb-4">Explorer {city.name}</p>
                          <div className="w-12 h-0.5 bg-white"></div>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))
            ) : (
              // Afficher des villes par défaut si l'API ne renvoie pas de données valides
              ['Douala', 'Yaoundé', 'Kribi', 'Limbé', 'Bafoussam', 'Garoua'].map((cityName, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link to={`/properties?city_name=${cityName}`}>
                    <motion.div 
                      whileHover={{ y: -8 }}
                      className="relative rounded-3xl overflow-hidden h-80 shadow-xl group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                      <motion.img 
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        src={`https://source.unsplash.com/featured/600x400?${cityName},city`} 
                        alt={cityName} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 p-8 text-white z-20">
                        <h3 className="text-3xl font-bold mb-2">{cityName}</h3>
                        <p className="text-blue-200">Découvrir</p>
                      </div>
                      
                      {/* Effet hover moderne */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-t from-primary-600/90 to-transparent z-15 flex items-end p-8"
                      >
                        <motion.div
                          initial={{ y: 20 }}
                          whileHover={{ y: 0 }}
                          className="text-white"
                        >
                          <p className="text-lg mb-4">Explorer {cityName}</p>
                          <div className="w-12 h-0.5 bg-white"></div>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Section avantages modernisée */}
      <section className="py-24 bg-gradient-to-br from-primary-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-green-50 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <FiShield />
              <span>Pourquoi nous choisir</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Pourquoi choisir FINDAM ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Notre plateforme offre de nombreux avantages pour les voyageurs et les propriétaires
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Réservations sécurisées',
                description: 'Système de paiement sécurisé avec Mobile Money et une réservation simple et transparente.',
                icon: '🔒',
                color: 'from-blue-500 to-cyan-500',
                bgColor: 'bg-blue-50'
              },
              {
                title: 'Vérification d\'identité',
                description: 'Tous nos utilisateurs sont vérifiés pour assurer votre sécurité et votre tranquillité.',
                icon: '✅',
                color: 'from-green-500 to-emerald-500',
                bgColor: 'bg-green-50'
              },
              {
                title: 'Support local',
                description: 'Une équipe locale disponible pour vous accompagner tout au long de votre expérience.',
                icon: '🇨🇲',
                color: 'from-yellow-500 to-orange-500',
                bgColor: 'bg-yellow-50'
              },
              {
                title: 'Codes promo',
                description: 'Profitez de promotions exclusives et de réductions négociées directement avec les propriétaires.',
                icon: '🎁',
                color: 'from-purple-500 to-pink-500',
                bgColor: 'bg-purple-50'
              },
              {
                title: 'Paiements flexibles',
                description: 'Options de paiement adaptées au contexte local et aux préférences des utilisateurs.',
                icon: '💳',
                color: 'from-indigo-500 to-blue-500',
                bgColor: 'bg-indigo-50'
              },
              {
                title: 'Messagerie intégrée',
                description: 'Communiquez facilement avec les propriétaires ou les locataires via notre plateforme.',
                icon: '💬',
                color: 'from-teal-500 to-cyan-500',
                bgColor: 'bg-teal-50'
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border border-gray-100 group"
              >
                <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                
                {/* Ligne décorative */}
                <div className={`w-0 h-1 bg-gradient-to-r ${feature.color} mt-6 group-hover:w-full transition-all duration-500`}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action modernisé */}
      <section className="py-24 bg-gradient-to-br from-primary-600 via-purple-700 to-primary-800 text-white relative overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 20,
              ease: "linear"
            }}
            className="absolute -top-24 -right-24 w-96 h-96 border border-white/10 rounded-full"
          />
          <motion.div
            animate={{ 
              rotate: [360, 0],
              scale: [1, // src/pages/LandingPage.jsx (suite)
            1.1, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 15,
              ease: "linear"
            }}
            className="absolute -bottom-32 -left-32 w-80 h-80 border border-white/5 rounded-full"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
              <FiHeart className="fill-current text-red-300" />
              <span>Rejoignez notre communauté</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              Prêt à trouver votre
              <span className="block bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                logement idéal ?
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl mb-12 text-blue-100 leading-relaxed max-w-3xl mx-auto">
              Que vous soyez en voyage d'affaires, en vacances ou à la recherche d'un logement longue durée, 
              FINDAM vous accompagne dans vos recherches.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/properties">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-primary-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-all shadow-xl flex items-center space-x-2 group"
                >
                  <span>Explorer les logements</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              
              <Link to="/register?type=owner">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white bg-white/10 backdrop-blur-sm px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-primary-600 transition-all flex items-center space-x-2 group"
                >
                  <span>Devenir propriétaire</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </div>
            
            {/* Garanties rapides */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center items-center space-x-8 mt-12 text-blue-200"
            >
              <div className="flex items-center space-x-2">
                <FiShield className="text-green-300" />
                <span>100% Sécurisé</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiStar className="text-yellow-300 fill-current" />
                <span>Support 24/7</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiHeart className="text-red-300 fill-current" />
                <span>Satisfait ou remboursé</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Témoignages modernisés */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-pink-50 text-pink-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <FiHeart className="fill-current" />
              <span>Témoignages clients</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ce que disent nos utilisateurs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Découvrez l'expérience vécue par notre communauté
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sophie Nguema',
                role: 'Locataire',
                content: 'J\'ai trouvé un appartement fantastique à Yaoundé pour mon séjour professionnel. Le processus était si simple et le propriétaire était très accueillant. Je recommande vivement FINDAM !',
                image: 'https://randomuser.me/api/portraits/women/44.jpg',
                rating: 5,
                location: 'Yaoundé'
              },
              {
                name: 'Paul Essomba',
                role: 'Propriétaire',
                content: 'En tant que propriétaire, FINDAM m\'a permis de trouver des locataires sérieux et de gérer facilement mes réservations. Le système de paiement sécurisé m\'a vraiment facilité la vie.',
                image: 'https://randomuser.me/api/portraits/men/86.jpg',
                rating: 5,
                location: 'Douala'
              },
              {
                name: 'Carole Dibango',
                role: 'Locataire',
                content: 'J\'ai utilisé FINDAM pour trouver un logement lors de mon voyage à Douala. L\'équipe a été très réactive et m\'a aidée à trouver le logement parfait en fonction de mes besoins.',
                image: 'https://randomuser.me/api/portraits/women/29.jpg',
                rating: 5,
                location: 'Kribi'
              },
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-gray-50 p-8 rounded-3xl relative overflow-hidden group hover:bg-white hover:shadow-xl transition-all border border-gray-100"
              >
                {/* Quote icon décoratif */}
                <div className="absolute top-4 right-4 text-4xl text-primary-100 group-hover:text-primary-200 transition-colors">
                  "
                </div>
                
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-lg text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role} • {testimonial.location}</p>
                    
                    {/* Étoiles */}
                    <div className="flex items-center mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed italic">"{testimonial.content}"</p>
                
                {/* Ligne décorative animée */}
                <div className="w-0 h-0.5 bg-gradient-to-r from-primary-500 to-purple-500 mt-6 group-hover:w-full transition-all duration-500"></div>
              </motion.div>
            ))}
          </div>
          
          {/* Note de confiance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-16"
          >
            <div className="inline-flex items-center space-x-4 bg-green-50 px-6 py-3 rounded-full">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-green-700 font-semibold">4.9/5 basé sur 500+ avis</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section modernisée */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span>❓</span>
              <span>Centre d'aide</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Vous avez des questions ? Nous avons les réponses.
            </p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                question: 'Comment fonctionne le processus de réservation ?',
                answer: 'Pour réserver un logement, sélectionnez les dates souhaitées, complétez les informations nécessaires et effectuez le paiement. Une fois la réservation confirmée par le propriétaire, vous recevrez les détails pour votre séjour.',
                icon: '📅'
              },
              {
                question: 'Quels sont les modes de paiement acceptés ?',
                answer: 'Nous acceptons les paiements par Mobile Money (Orange Money, MTN Mobile Money), cartes bancaires et virements bancaires selon les options disponibles dans votre région.',
                icon: '💳'
              },
              {
                question: 'Comment devenir propriétaire sur FINDAM ?',
                answer: 'Pour devenir propriétaire, inscrivez-vous, complétez votre profil et vérifiez votre identité. Vous pourrez ensuite ajouter vos logements avec photos et détails complets, puis choisir un abonnement adapté à vos besoins.',
                icon: '🏠'
              },
              {
                question: 'Que faire en cas de problème pendant mon séjour ?',
                answer: 'En cas de problème, contactez directement le propriétaire via notre messagerie intégrée. Si le problème persiste, notre équipe de support est disponible pour vous aider à résoudre la situation.',
                icon: '🛟'
              },
              {
                question: 'Comment fonctionne le système de codes promo ?',
                answer: 'Les propriétaires peuvent créer des codes promo personnalisés pour offrir des réductions aux locataires. Ces codes peuvent être appliqués lors du processus de réservation pour obtenir une remise sur le prix total.',
                icon: '🎁'
              }
            ].map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all"
              >
                <details className="group">
                  <summary className="flex justify-between items-center p-6 cursor-pointer font-medium text-gray-900 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{faq.icon}</span>
                      <span className="text-lg">{faq.question}</span>
                    </div>
                    <motion.span 
                      animate={{ rotate: 0 }}
                      className="transition-transform duration-300 group-open:rotate-180 text-primary-500"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.span>
                  </summary>
                  <motion.div
                    initial={false}
                    className="px-6 pb-6 text-gray-700 leading-relaxed bg-gray-50/50"
                  >
                    {faq.answer}
                  </motion.div>
                </details>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link to="/faq">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto group"
              >
                <span>Voir toutes les questions</span>
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 25,
              ease: "linear"
            }}
            className="absolute top-10 right-10 w-64 h-64 border border-white/10 rounded-full"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
              <span>📧</span>
              <span>Restez informé</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ne manquez aucune nouvelle offre
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Inscrivez-vous à notre newsletter pour recevoir les dernières offres et actualités de FINDAM.
            </p>
            
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-white text-primary-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-lg"
              >
                S'inscrire
              </motion.button>
            </motion.form>
            
            <p className="text-sm text-blue-200 mt-4">
              Pas de spam, uniquement des offres de qualité. Désabonnement possible à tout moment.
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default LandingPage;
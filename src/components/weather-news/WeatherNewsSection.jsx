import { useState, useEffect } from 'react';
import { CloudSun, Wind, Thermometer, Search, Globe, Newspaper, ExternalLink } from 'lucide-react';
import { MatrixButton } from '../common/MatrixButton';

export const WeatherNewsSection = () => {
    // État pour la recherche de ville
    const [cityName, setCityName] = useState('La Rochelle');
    const [countryName, setCountryName] = useState('France');

    // Données météo et actualités
    const [weather, setWeather] = useState(null);
    const [news, setNews] = useState([]);
    const [loadingWeather, setLoadingWeather] = useState(false);
    const [loadingNews, setLoadingNews] = useState(false);
    const [error, setError] = useState(null);

    // Fonction pour récupérer la météo via Open-Meteo (Géocodage + Météo)
    const fetchWeatherData = async (city, country) => {
        setLoadingWeather(true);
        setError(null);
        try {
            // 1. Géocodage pour trouver latitude et longitude
            const geoQuery = `${city}${country ? `, ${country}` : ''}`;
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(geoQuery)}&count=1&language=fr&format=json`);
            const geoData = await geoRes.json();

            if (!geoData.results || geoData.results.length === 0) {
                throw new Error(`Ville introuvable : "${city}"`);
            }

            const { latitude, longitude, name, country: foundCountry } = geoData.results[0];

            // 2. Appel météo sur Open-Meteo
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`);
            const weatherData = await weatherRes.json();

            setWeather({
                city: name,
                country: foundCountry || country,
                temperature: weatherData.current.temperature_2m,
                humidity: weatherData.current.relative_humidity_2m,
                windSpeed: weatherData.current.wind_speed_10m,
                conditionCode: weatherData.current.weather_code
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingWeather(false);
        }
    };

    // Fonction pour récupérer des actualités (via une API ouverte ou des flux technologiques)
    const fetchNewsData = async (query) => {
        setLoadingNews(true);
        try {
            // Utilisation de l'API publique Hacker News / ou articles technologiques récents via une source JSON ouverte
            const res = await fetch(`https://hacker-news.firebaseio.com/v0/topstories.json`);
            const storyIds = await res.json();

            // Récupérer les 6 premiers articles
            const topStoriesPromises = storyIds.slice(0, 6).map(async (id) => {
                const storyRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
                return storyRes.json();
            });

            const stories = await Promise.all(topStoriesPromises);
            setNews(stories);
        } catch (err) {
            console.error("Erreur lors du chargement des actualités", err);
        } finally {
            setLoadingNews(false);
        }
    };

    // Chargement initial par défaut sur La Rochelle
    useEffect(() => {
        fetchWeatherData('La Rochelle', 'France');
        fetchNewsData('La Rochelle');
    }, []);

    // Gestion du formulaire de recherche
    const handleSearch = (e) => {
        e.preventDefault();
        if (!cityName.trim()) return;
        fetchWeatherData(cityName, countryName);
        fetchNewsData(cityName);
    };

    // Interprétation basique des codes météo Open-Meteo
    const getWeatherDescription = (code) => {
        if (code === 0) return 'Ciel dégagé / Ensoleillé';
        if (code >= 1 && code <= 3) return 'Partiellement nuageux';
        if (code >= 45 && code <= 48) return 'Brouillard / Brume';
        if (code >= 51 && code <= 67) return 'Pluies / Précipitations';
        if (code >= 71 && code <= 77) return 'Neige';
        if (code >= 95) return 'Orages électriques';
        return 'Conditions variables';
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 font-mono pb-12">

            {/* Formulaire de recherche géographique */}
            <div className="bg-matrix-card border border-matrix-border p-6 shadow-neon">
                <div className="flex items-center space-x-2 mb-4">
                    <Globe className="w-5 h-5 text-matrix-neon" />
                    <h2 className="text-sm font-bold text-matrix-neon uppercase tracking-wider">
                        TERMINAL // RECHERCHE GÉOGRAPHIQUE & MÉTÉO
                    </h2>
                </div>

                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-matrix-text mb-1">NOM DE LA VILLE</label>
                        <input
                            type="text"
                            value={cityName}
                            onChange={(e) => setCityName(e.target.value)}
                            placeholder="Ex: Paris, Tokyo, La Rochelle..."
                            className="w-full bg-matrix-bg border border-matrix-muted px-3 py-2 text-xs text-matrix-text focus:border-matrix-neon outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-matrix-text mb-1">NOM DU PAYS (FACULTATIF)</label>
                        <input
                            type="text"
                            value={countryName}
                            onChange={(e) => setCountryName(e.target.value)}
                            placeholder="Ex: France, Japon..."
                            className="w-full bg-matrix-bg border border-matrix-muted px-3 py-2 text-xs text-matrix-text focus:border-matrix-neon outline-none"
                        />
                    </div>
                    <div className="flex items-end">
                        <MatrixButton type="submit" className="w-full justify-center py-2.5">
                            <Search className="w-4 h-4 inline mr-2" />
                            Rechercher
                        </MatrixButton>
                    </div>
                </form>
            </div>

            {/* Grille principale : Météo à gauche, Actualités à droite */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Widget Météo */}
                <div className="lg:col-span-1 bg-matrix-card border border-matrix-border p-6 space-y-6 shadow-neon flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-matrix-muted/40 pb-3 mb-4">
                            <span className="text-xs text-matrix-muted uppercase tracking-widest">[STATUT MÉTÉO]</span>
                            <CloudSun className="w-6 h-6 text-matrix-neon" />
                        </div>

                        {loadingWeather ? (
                            <p className="text-xs text-matrix-muted text-center py-12 animate-pulse">Chargement des données satellites...</p>
                        ) : error ? (
                            <p className="text-xs text-red-400 p-3 bg-red-950/40 border border-red-600">{error}</p>
                        ) : weather ? (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-matrix-text">{weather.city}</h3>
                                    <p className="text-xs text-matrix-neon uppercase tracking-wider">{weather.country}</p>
                                </div>

                                <div className="flex items-center justify-between bg-matrix-bg p-4 border border-matrix-muted/60">
                                    <div className="flex items-center space-x-3">
                                        <Thermometer className="w-8 h-8 text-matrix-neon" />
                                        <div>
                                            <span className="text-3xl font-bold text-matrix-text">{weather.temperature}°C</span>
                                            <p className="text-[10px] text-matrix-muted">{getWeatherDescription(weather.conditionCode)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div className="bg-matrix-bg p-3 border border-matrix-muted/40">
                                        <span className="block text-[10px] text-matrix-muted">HUMIDITÉ</span>
                                        <span className="text-matrix-text font-bold">{weather.humidity}%</span>
                                    </div>
                                    <div className="bg-matrix-bg p-3 border border-matrix-muted/40">
                                        <span className="block text-[10px] text-matrix-muted">VENT</span>
                                        <span className="text-matrix-text font-bold flex items-center space-x-1">
                                            <Wind className="w-3 h-3 text-matrix-neon inline" />
                                            <span>{weather.windSpeed} km/h</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="text-[10px] text-matrix-muted pt-4 border-t border-matrix-muted/30 text-center">
                        Source : Open-Meteo (Open-Source API)
                    </div>
                </div>

                {/* Flux d'Actualités */}
                <div className="lg:col-span-2 bg-matrix-card border border-matrix-border p-6 space-y-4 shadow-neon">
                    <div className="flex items-center justify-between border-b border-matrix-muted/40 pb-3">
                        <div className="flex items-center space-x-2">
                            <Newspaper className="w-5 h-5 text-matrix-neon" />
                            <h3 className="text-sm font-bold text-matrix-neon uppercase tracking-wider">
                                FLUX D'ACTUALITÉS // CYBER-WIRE
                            </h3>
                        </div>
                        <span className="text-[10px] text-matrix-muted">[LIVE FEED]</span>
                    </div>

                    {loadingNews ? (
                        <p className="text-xs text-matrix-muted text-center py-12 animate-pulse">Réception des flux de données mondiaux...</p>
                    ) : (
                        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
                            {news.map((item, index) => (
                                <div key={item.id || index} className="bg-matrix-bg p-4 border border-matrix-muted/50 hover:border-matrix-neon transition-colors space-y-2">
                                    <div className="flex justify-between items-center text-[10px] text-matrix-muted">
                                        <span className="text-matrix-neon">SCORE: {item.score || 100}pts</span>
                                        <span>{new Date((item.time || Date.now() / 1000) * 1000).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="text-xs font-bold text-matrix-text tracking-wide">{item.title}</h4>
                                    {item.url && (
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center space-x-1 text-[10px] text-matrix-neon hover:underline pt-1"
                                        >
                                            <span>Accéder à la source</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
};
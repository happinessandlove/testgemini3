
import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  MoreHorizontal, 
  Home, 
  Compass, 
  User,
  Plane,
  Train,
  Hotel,
  Ticket,
  Briefcase,
  RefreshCw,
  Sparkles,
  Loader2,
  Flame
} from 'lucide-react';
import { TravelType, FlightDeal } from './types';
import { getTravelRecommendations } from './services/geminiService';
import Calendar from './Calendar';
import { formatDate } from './utils';

// --- Components ---

interface CategoryIconProps {
  icon: React.ElementType;
  label: string;
  color: string;
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ icon: Icon, label, color }) => (
  <div className="flex flex-col items-center space-y-2 min-w-[20%] group cursor-pointer">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} text-white shadow-md transform transition-transform group-active:scale-95`}>
      <Icon size={24} />
    </div>
    {/* Dark text for high contrast */}
    <span className="text-xs text-slate-700 font-bold tracking-tight group-hover:text-blue-600 transition-colors">{label}</span>
  </div>
);

interface TabButtonProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ active, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`relative px-3 py-2 text-[15px] font-bold transition-all duration-300 ${active ? 'text-blue-600 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
  >
    {label}
    {active && (
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-blue-600 rounded-full" />
    )}
  </button>
);

interface FlightDealCardProps {
  deal: FlightDeal;
}

const FlightDealCard: React.FC<FlightDealCardProps> = ({ deal }) => (
  <div className="flex items-center justify-between p-3 bg-white rounded-xl mb-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center space-x-3">
      <div className="relative shrink-0">
        <img src={deal.imageUrl} alt={deal.destination} className="w-20 h-16 object-cover rounded-lg shadow-sm" />
        {deal.rank && deal.rank <= 3 && (
          <div className={`absolute -top-1.5 -left-1.5 text-[10px] px-2 py-0.5 rounded-br-lg rounded-tl-lg text-white font-bold shadow-sm
            ${deal.rank === 1 ? 'bg-gradient-to-r from-red-500 to-pink-500' : deal.rank === 2 ? 'bg-gradient-to-r from-orange-400 to-yellow-500' : 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-yellow-900'}`}>
            TOP{deal.rank}
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <h3 className="font-bold text-gray-800 text-base">上海 <span className="text-blue-300 text-xs mx-1">✈</span> {deal.destination}</h3>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 flex items-center font-medium">
          <span className="inline-block w-1 h-1 rounded-full bg-gray-300 mr-1.5"></span>
          {deal.date}
        </p>
      </div>
    </div>
    <div className="text-right">
      <div className="text-xl font-bold text-orange-600 leading-none font-mono tracking-tight">
        <span className="text-xs text-orange-400 font-normal mr-0.5">¥</span>
        {deal.price}
        <span className="text-xs text-gray-400 font-normal ml-0.5">起</span>
      </div>
      <div className="mt-1.5">
         <span className="text-[10px] text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded font-medium">超值</span>
      </div>
    </div>
  </div>
);

interface BottomNavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({ icon: Icon, label, active }) => (
  <button className={`flex flex-col items-center space-y-1 w-full py-1 transition-colors ${active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-500'}`}>
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

// --- Main App ---

const TAB_LABELS: Record<TravelType, string> = {
  [TravelType.FLIGHT]: '机票',
  [TravelType.TRAIN]: '火车票',
  [TravelType.HOTEL]: '酒店',
  [TravelType.VACATION]: '度假',
  [TravelType.TICKET]: '门票',
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TravelType>(TravelType.FLIGHT);
  const [origin, setOrigin] = useState('上海');
  const [destination, setDestination] = useState('');
  
  // Date State
  const [departureDate, setDepartureDate] = useState<Date>(new Date());
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  
  // Calendar State
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMode, setCalendarMode] = useState<'departure' | 'return'>('departure');

  const [deals, setDeals] = useState<FlightDeal[]>([
    { id: 1, destination: '温州', date: '11月24日 周一去', price: 210, imageUrl: 'https://picsum.photos/100/80?random=1', rank: 1 },
    { id: 2, destination: '南京', date: '11月24日 周一去', price: 230, imageUrl: 'https://picsum.photos/100/80?random=2', rank: 2 },
    { id: 3, destination: '合肥', date: '11月24日 周一去', price: 232, imageUrl: 'https://picsum.photos/100/80?random=3', rank: 3 },
  ]);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination || '目的地');
    setDestination(temp);
  };

  const handleAskAI = async () => {
    setLoadingAI(true);
    try {
      const recommendations = await getTravelRecommendations(origin === '目的地' ? '上海' : origin);
      
      if (recommendations.length > 0) {
        const newDeals: FlightDeal[] = recommendations.map((rec, index) => ({
          id: Date.now() + index,
          destination: rec.city,
          date: '下个周末',
          price: rec.estimatedPrice,
          imageUrl: `https://picsum.photos/100/80?random=${index + 10}`,
          rank: index + 1
        }));
        setDeals(newDeals);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAI(false);
    }
  };
  
  const openCalendar = (mode: 'departure' | 'return') => {
    setCalendarMode(mode);
    setShowCalendar(true);
  };

  const handleDateConfirm = (date: Date) => {
    if (calendarMode === 'departure') {
      setDepartureDate(date);
      // Reset return date if it's before new departure
      if (returnDate && date > returnDate) {
        setReturnDate(null);
      }
    } else {
      setReturnDate(date);
    }
    setShowCalendar(false);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F0F4F8] pb-24 relative overflow-hidden font-sans">
      
      <Calendar 
        isOpen={showCalendar} 
        onClose={() => setShowCalendar(false)} 
        onConfirm={handleDateConfirm}
        initialDate={calendarMode === 'departure' ? departureDate : (returnDate || new Date())}
        title={calendarMode === 'departure' ? '选择出发日期' : '选择返程日期'}
      />

      {/* Header Background Gradient - Very light blue top, fading to page bg */}
      <div className="absolute top-0 left-0 w-full h-[280px] bg-gradient-to-b from-blue-100 via-blue-50 to-[#F0F4F8] -z-10"></div>
      <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-200/30 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none"></div>
      <div className="absolute top-20 left-0 w-[150px] h-[150px] bg-indigo-200/20 rounded-full blur-2xl -translate-x-10 pointer-events-none"></div>

      {/* Top Bar - Dark text for visibility */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between text-slate-800 z-20 relative">
        {/* Logo/Brand - White background pill for max contrast */}
        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50 shadow-sm">
          <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-sm">
             <span className="text-[12px] font-black text-white transform -rotate-90">:)</span>
          </div>
          <span className="text-sm font-bold tracking-wide text-slate-800">蓝途旅行</span>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* "Add Desktop" Button - Solid White bg */}
          <button className="text-xs border border-gray-200 bg-white text-slate-800 px-3 py-1.5 rounded-full font-bold active:scale-95 transition-transform shadow-sm">
            + 加桌面
          </button>
          {/* More Menu - Solid White bg */}
          <button className="p-1.5 bg-white border border-gray-200 rounded-full shadow-sm text-slate-700 hover:bg-gray-50">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 mt-3 relative z-20">
        <div className="bg-white rounded-full shadow-[0_4px_15px_-3px_rgba(59,130,246,0.15)] border border-blue-50 flex items-center p-1.5 pl-2">
          <div className="flex items-center px-3 border-r border-gray-100 cursor-pointer hover:bg-gray-50 rounded-l-full transition-colors py-1.5">
            <span className="text-slate-800 font-bold text-sm mr-1.5">{origin}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
          <div className="flex-1 flex items-center px-3 text-gray-400">
            <Search size={18} className="mr-2 text-blue-500" />
            <input 
              type="text" 
              placeholder="搜索目的地 / 关键词" 
              className="w-full bg-transparent outline-none text-sm text-slate-800 placeholder-slate-400 h-8"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
          <div className="p-0.5">
             <button 
              onClick={handleAskAI}
              disabled={loadingAI}
              className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 animate-pulse hover:scale-110 transition-transform active:scale-95"
             >
               {loadingAI ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16} fill="white" />}
             </button>
          </div>
        </div>
      </div>

      {/* Quick Nav - High contrast labels */}
      <div className="px-5 mt-6 flex justify-between overflow-x-auto no-scrollbar pb-2 relative z-20">
        <CategoryIcon icon={Plane} label="牛人专线" color="bg-gradient-to-br from-blue-500 to-blue-700" />
        <CategoryIcon icon={Train} label="牛人严选" color="bg-gradient-to-br from-orange-500 to-orange-700" />
        <CategoryIcon icon={Hotel} label="长隆酒景" color="bg-gradient-to-br from-emerald-500 to-emerald-700" />
        <CategoryIcon icon={Briefcase} label="包车游" color="bg-gradient-to-br from-cyan-500 to-cyan-700" />
        <CategoryIcon icon={Ticket} label="迪士尼" color="bg-gradient-to-br from-purple-500 to-purple-700" />
      </div>

      {/* Main Search Card */}
      <div className="px-3 mt-4 relative z-20">
        <div className="bg-white rounded-[1.5rem] shadow-xl shadow-blue-900/5 overflow-hidden border border-white">
          {/* Tabs */}
          <div className="flex justify-between items-center px-3 pt-3 pb-1 bg-gradient-to-b from-blue-50/50 to-white">
             {Object.values(TravelType).map((type) => (
               <TabButton 
                key={type} 
                label={TAB_LABELS[type]} 
                active={activeTab === type} 
                onClick={() => setActiveTab(type)}
               />
             ))}
          </div>

          {/* Promo Strip */}
          <div className="mx-4 mt-2 bg-gradient-to-r from-orange-50 to-white border border-orange-100 rounded-lg px-3 py-2 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">机酒联订</span>
              <span className="text-slate-700 text-xs font-medium truncate max-w-[140px]">订完机票订酒店, 返现优惠</span>
            </div>
            <span className="text-orange-600 text-xs font-bold flex items-center shrink-0">
              最高返¥188 <span className="text-[10px] ml-0.5">❯</span>
            </span>
          </div>

          {/* Flight Search Form */}
          <div className="p-5">
            {/* Toggle */}
            <div className="flex bg-slate-100 rounded-lg p-1 w-max mb-6 shadow-inner">
              <button className="bg-white shadow-sm text-xs font-bold px-5 py-2 rounded-[0.4rem] text-blue-600 transition-all">单程</button>
              <button className="text-xs font-medium px-5 py-2 rounded-[0.4rem] text-slate-500 hover:bg-slate-200 transition-all">特价机票</button>
            </div>

            {/* Route */}
            <div className="flex justify-between items-center mb-7 relative px-1">
              <div 
                className="flex flex-col items-start w-1/3 cursor-pointer group"
                onClick={() => openCalendar('departure')}
              >
                 <span className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{origin}</span>
                 <span className="text-xs text-slate-400 mt-1.5 font-medium bg-slate-50 px-2 py-0.5 rounded">
                   {formatDate(departureDate)}
                 </span>
              </div>
              
              <div className="absolute left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <button 
                  onClick={handleSwap} 
                  className="bg-white p-2.5 rounded-full border-2 border-slate-50 shadow-md hover:shadow-lg group transition-all active:scale-90"
                >
                  <RefreshCw size={20} className="text-blue-500 group-hover:rotate-180 transition-transform duration-500" />
                </button>
              </div>

              <div 
                className="flex flex-col items-end w-1/3 cursor-pointer group"
                onClick={() => openCalendar('return')}
              >
                 <span className={`text-2xl font-bold transition-colors ${destination ? 'text-slate-800 group-hover:text-blue-600' : 'text-slate-300'}`}>
                   {destination || '目的地'}
                 </span>
                 <span className={`text-xs mt-1.5 font-medium px-2 py-0.5 rounded ${returnDate ? 'bg-slate-50 text-slate-400' : 'text-blue-500 bg-blue-50'}`}>
                   {returnDate ? formatDate(returnDate) : '选择日期'}
                 </span>
              </div>
            </div>

            {/* CTA */}
            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center relative overflow-hidden group transition-all transform active:scale-[0.98]">
               <span className="relative z-10 text-lg tracking-wide text-left w-full pl-8">特价查询</span>
               {/* Yellow Banner Fixed: Removed Translate, Adjusted Padding */}
               <div className="absolute right-0 top-0 h-full bg-gradient-to-l from-yellow-400 to-yellow-300 skew-x-12 origin-bottom-right flex items-center pl-8 pr-6">
                 <div className="flex flex-col items-center justify-center leading-none transform -skew-x-12">
                   <span className="text-[9px] text-yellow-900/70 font-bold mb-0.5">机酒联订</span>
                   <span className="text-sm text-yellow-900 font-black whitespace-nowrap">最高返¥188</span>
                 </div>
               </div>
            </button>
          </div>
        </div>
      </div>

      {/* Low Price List */}
      <div className="mt-8">
        {/* Section Header */}
        <div className="px-5 mb-4 flex items-end justify-between">
          <div>
             <h2 className="text-xl font-extrabold text-slate-800 flex items-center tracking-tight">
               优选低价榜
               <Flame size={16} className="ml-1.5 text-orange-500 fill-orange-500 animate-pulse" />
             </h2>
             <div className="text-slate-500 text-xs flex items-center mt-1 font-medium">
               <MapPin size={12} className="mr-1 text-blue-500" />
               {origin} 出发 <span className="mx-1 text-slate-300">|</span> 实时低价推荐
             </div>
          </div>
          <button 
            onClick={handleAskAI}
            className="text-[11px] text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full font-bold flex items-center hover:bg-blue-100 transition-colors"
          >
            {loadingAI ? <Loader2 size={12} className="animate-spin mr-1"/> : <Sparkles size={12} className="mr-1 text-blue-500" />}
            {loadingAI ? "计算中..." : "AI 推荐"}
          </button>
        </div>

        {/* Cards */}
        <div className="px-3 space-y-3">
          {deals.map((deal) => (
            <FlightDealCard key={deal.id} deal={deal} />
          ))}
          
          <button className="w-full py-4 text-center text-slate-400 text-xs font-medium hover:text-blue-500 transition-colors flex items-center justify-center">
            查看更多低价航班 <ChevronDown size={14} className="ml-1" />
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 px-8 py-3 flex justify-between items-center pb-6 z-50 text-slate-600 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)]">
        <BottomNavItem icon={Home} label="首页" active />
        <BottomNavItem icon={Compass} label="目的地" />
        <BottomNavItem icon={User} label="我的" />
      </div>
    </div>
  );
};

export default App;

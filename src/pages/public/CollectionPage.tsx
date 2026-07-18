import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Design } from '../../types';
import { DesignCard } from '../../components/ui/DesignCard';
import { useNotification } from '../../contexts/NotificationContext';

const EMB_DESIGN_TYPES = [
  'All', 
  'Flat/Multi Designs', 
  'Only Cording Designs', 
  'Only Sequin Designs', 
  'Only Chain Stitch Designs', 
  'Multi+Cording Designs',
  'Beads and Sequin Designs',
  'Multi+Cording+Sequin Designs',
  'Multi+Sequin Designs',
  'Multi+Chain Stitch Designs',
  'Dual & Sandwich Sequin',
  '2/4/6 Sequin Design',
  'Cording + Sequin Designs'
];
const WEAVING_DESIGN_TYPES = ['All', '2 fider design', '3 fider design', '4 fider design', '2688 design', '5376 design(jumbo)', 'power loom design'];

const EMB_AREAS = ['All', '100 mm', '125 mm', '150 mm', '175 mm', '200 mm', '225 mm', '250 mm', '300 mm', '330 mm', '400 mm', '500 mm', '600 mm'];
const WEAVING_AREAS = ['All', '88 to 96', '100 to 110', '112 to 124', '188 to 200', '216 to 240'];

const NEEDLES = ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const DESIGN_FORMATS = ['All', 'EMB', 'DST', 'JEF', 'PES', 'DHP', 'VIP', 'PEC', 'VP3', 'XXX', 'HUS', 'SEW'];
const SAREE_CONCEPTS = [
  'All', 
  'Box Pallu', 
  'C Pallu', 
  'Figure', 
  'Ton to Ton', 
  'Dhaga Test',
  'Cut-Peast',
  'Diamond test',
  'Single jari',
  'Cut Work',
  'Form',
  'Patli Pallu',
  'Half-Half',
  'Jaal',
  'Kalkatti Test',
  'Marun Test',
  'Panel',
  'Butta Saree',
  'Daman',
  'Kashmiri Test',
  'Packing',
  'South Test',
  'Lace Butta'
];
const WEAVING_FORMATS = ['All', 'BMP', 'PDC'];
const WEAVING_CONCEPTS = [
  'All',
  'jumbo design',
  'box pallu',
  'c-pallu',
  'pushmeena',
  'satin',
  'peithani',
  'butt + butti + leriya',
  'cotton',
  'georget',
  'topdyed',
  'nylon'
];

const ALL_SAREE_SUBCATEGORIES_VALUES = [
  'Saree Design',
  'Kota Lichi Design',
  '50 600 Design',
  'Dolla-Nylon Design',
  'Viscouse Design',
  '(50 600) Satin Design',
  'Nylon Satin Design',
  'Cotton Design',
  'Dharmavarm Design',
  'Pattern Beam Design',
  'Mix Design',
  'Georgept (Crape) Design'
];

const SAREE_SUBCATEGORIES = [
  {
    name: 'All Saree',
    value: 'Saree Design',
    image: '/saree_weaving_design.jpg',
  },
  {
    name: 'Kota Lichi Design',
    value: 'Kota Lichi Design',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
  },
  {
    name: '50 600 Design',
    value: '50 600 Design',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  },
  {
    name: 'Dolla-Nylon Design',
    value: 'Dolla-Nylon Design',
    image: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=200&h=200&fit=crop',
  },
  {
    name: 'Viscouse Design',
    value: 'Viscouse Design',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  },
  {
    name: '(50 600) Satin Design',
    value: '(50 600) Satin Design',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
  },
  {
    name: 'Nylon Satin Design',
    value: 'Nylon Satin Design',
    image: 'https://images.unsplash.com/photo-1502740479091-635887520276?w=200&h=200&fit=crop',
  },
  {
    name: 'Cotton Design',
    value: 'Cotton Design',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=200&h=200&fit=crop',
  },
  {
    name: 'Dharmavarm Design',
    value: 'Dharmavarm Design',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
  },
  {
    name: 'Pattern Beam Design',
    value: 'Pattern Beam Design',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop',
  },
  {
    name: 'Mix Design',
    value: 'Mix Design',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&h=200&fit=crop',
  },
  {
    name: 'Georgept (Crape) Design',
    value: 'Georgept (Crape) Design',
    image: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=200&h=200&fit=crop',
  }
];

const ALL_LEHENGHA_SUBCATEGORIES_VALUES = [
  'Lehengha Design',
  'Lehengha - 50 600 Design',
  'Lehengha - Kota Lichi Design',
  'Lehengha - Viscouse Design',
  'Lehengha - Nylon Satin Design'
];

const LEHENGHA_SUBCATEGORIES = [
  {
    name: 'All Lehengha',
    value: 'Lehengha Design',
    image: '/lehengha_weaving_design.jpg',
  },
  {
    name: '50 600 Design',
    value: 'Lehengha - 50 600 Design',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  },
  {
    name: 'Kota Lichi Design',
    value: 'Lehengha - Kota Lichi Design',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
  },
  {
    name: 'Viscouse Design',
    value: 'Lehengha - Viscouse Design',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
  },
  {
    name: 'Nylon Satin Design',
    value: 'Lehengha - Nylon Satin Design',
    image: 'https://images.unsplash.com/photo-1502740479091-635887520276?w=200&h=200&fit=crop',
  }
];

const ALL_SUIT_SUBCATEGORIES_VALUES = [
  'Suit Design',
  'Suit - Kota Lichi Design',
  'Suit - Viscouse Design',
  'Suit - (50 600) Satin Design',
  'Suit - Cotton Design'
];

const SUIT_SUBCATEGORIES = [
  {
    name: 'All Suit',
    value: 'Suit Design',
    image: '/suit_weaving_design.jpg',
  },
  {
    name: 'Kota Lichi Design',
    value: 'Suit - Kota Lichi Design',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
  },
  {
    name: 'Viscouse Design',
    value: 'Suit - Viscouse Design',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  },
  {
    name: '(50 600) Satin Design',
    value: 'Suit - (50 600) Satin Design',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
  },
  {
    name: 'Cotton Design',
    value: 'Suit - Cotton Design',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=200&h=200&fit=crop',
  }
];

const ALL_DUPATTA_SUBCATEGORIES_VALUES = [
  'Dupatta Design',
  'Dupatta - Kota Lichi Design',
  'Dupatta - 50 600 Design',
  'Dupatta - Dolla-Nylon Design',
  'Dupatta - Viscouse Design',
  'Dupatta - (50 600) Satin Design',
  'Dupatta - Nylon Satin Design',
  'Dupatta - Cotton Design'
];

const DUPATTA_SUBCATEGORIES = [
  {
    name: 'All Dupatta',
    value: 'Dupatta Design',
    image: '/dupatta_weaving_design.jpg',
  },
  {
    name: 'Kota Lichi Design',
    value: 'Dupatta - Kota Lichi Design',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
  },
  {
    name: '50 600 Design',
    value: 'Dupatta - 50 600 Design',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  },
  {
    name: 'Dolla-Nylon Design',
    value: 'Dupatta - Dolla-Nylon Design',
    image: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=200&h=200&fit=crop',
  },
  {
    name: 'Viscouse Design',
    value: 'Dupatta - Viscouse Design',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
  },
  {
    name: '(50 600) Satin Design',
    value: 'Dupatta - (50 600) Satin Design',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
  },
  {
    name: 'Nylon Satin Design',
    value: 'Dupatta - Nylon Satin Design',
    image: 'https://images.unsplash.com/photo-1502740479091-635887520276?w=200&h=200&fit=crop',
  },
  {
    name: 'Cotton Design',
    value: 'Dupatta - Cotton Design',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=200&h=200&fit=crop',
  }
];

const ALL_MEKHENA_CHADAR_SUBCATEGORIES_VALUES = [
  'Mekhena + Chadar Design',
  'Mekhena + Chadar - Kota Lichi Design',
  'Mekhena + Chadar - 50 600 Design',
  'Mekhena + Chadar - Nylon Design',
  'Mekhena + Chadar - Cotton Sprun Design'
];

const MEKHENA_CHADAR_SUBCATEGORIES = [
  {
    name: 'All Mekhena + Chadar',
    value: 'Mekhena + Chadar Design',
    image: '/mekhena_chadar_weaving_design.jpg',
  },
  {
    name: 'Kota Lichi Design',
    value: 'Mekhena + Chadar - Kota Lichi Design',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
  },
  {
    name: '50 600 Design',
    value: 'Mekhena + Chadar - 50 600 Design',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  },
  {
    name: 'Nylon Design',
    value: 'Mekhena + Chadar - Nylon Design',
    image: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=200&h=200&fit=crop',
  },
  {
    name: 'Cotton Sprun Design',
    value: 'Mekhena + Chadar - Cotton Sprun Design',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=200&h=200&fit=crop',
  }
];

const ALL_MULTI_SUBCATEGORIES_VALUES = [
  'Multi Design',
  'Saree Daman',
  'C Pallu - Box Pallu',
  'Gala-Nack-Single Head',
  'Kurti-Gala',
  'Buta',
  'Buti',
  'Sut Daman & Dupta',
  'Lace',
  'Figar',
  'Garment-Servani',
  'Penal-Pta',
  'Choli-Kli',
  'Blouse',
  'Rajasthani-Kli',
  'Lengha-Kli',
  'Patli Daman',
  'Cross Stitch',
  'Kasmiri Design',
  'Jal',
  'Gamthi Design'
];

const MULTI_SUBCATEGORIES = [
  {
    name: 'All Multi',
    value: 'Multi Design',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
  },
  {
    name: 'Saree Daman',
    value: 'Saree Daman',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  },
  {
    name: 'C Pallu - Box Pallu',
    value: 'C Pallu - Box Pallu',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
  },
  {
    name: 'Gala-Nack-Single Head',
    value: 'Gala-Nack-Single Head',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
  },
  {
    name: 'Kurti-Gala',
    value: 'Kurti-Gala',
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=200&h=200&fit=crop',
  },
  {
    name: 'Buta',
    value: 'Buta',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
  },
  {
    name: 'Buti',
    value: 'Buti',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200&h=200&fit=crop',
  },
  {
    name: 'Sut Daman & Dupta',
    value: 'Sut Daman & Dupta',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop',
  },
  {
    name: 'Lace',
    value: 'Lace',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&h=200&fit=crop',
  },
  {
    name: 'Figar',
    value: 'Figar',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=200&h=200&fit=crop',
  },
  {
    name: 'Garment-Servani',
    value: 'Garment-Servani',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
  },
  {
    name: 'Penal-Pta',
    value: 'Penal-Pta',
    image: 'https://images.unsplash.com/photo-1502740479091-635887520276?w=200&h=200&fit=crop',
  },
  {
    name: 'Choli-Kli',
    value: 'Choli-Kli',
    image: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=200&h=200&fit=crop',
  },
  {
    name: 'Blouse',
    value: 'Blouse',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  },
  {
    name: 'Rajasthani-Kli',
    value: 'Rajasthani-Kli',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
  },
  {
    name: 'Lengha-Kli',
    value: 'Lengha-Kli',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=200&h=200&fit=crop',
  },
  {
    name: 'Patli Daman',
    value: 'Patli Daman',
    image: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=200&h=200&fit=crop',
  },
  {
    name: 'Cross Stitch',
    value: 'Cross Stitch',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&h=200&fit=crop',
  },
  {
    name: 'Kasmiri Design',
    value: 'Kasmiri Design',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&h=200&fit=crop',
  },
  {
    name: 'Jal',
    value: 'Jal',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=200&h=200&fit=crop',
  },
  {
    name: 'Gamthi Design',
    value: 'Gamthi Design',
    image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=200&h=200&fit=crop',
  }
];

const ALL_SEQUIN_SUBCATEGORIES_VALUES = [
  'Sequin Design',
  'Dual-Sq',
  'Bhugali-Sq',
  'Garment & Servani',
  'Gala-Top & Tabla',
  'Daman',
  'Sut-Daman & Dupta',
  'Choli & Blouse',
  'Buta',
  'Buti Small',
  'Kli-Lengha',
  'C Pallu',
  'Lace',
  'Figar Design',
  'No Panching'
];

const SEQUIN_SUBCATEGORIES = [
  {
    name: 'All Sequin',
    value: 'Sequin Design',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
  },
  {
    name: 'Dual-Sq',
    value: 'Dual-Sq',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  },
  {
    name: 'Bhugali-Sq',
    value: 'Bhugali-Sq',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
  },
  {
    name: 'Garment & Servani',
    value: 'Garment & Servani',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
  },
  {
    name: 'Gala-Top & Tabla',
    value: 'Gala-Top & Tabla',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&h=200&fit=crop',
  },
  {
    name: 'Daman',
    value: 'Daman',
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=200&h=200&fit=crop',
  },
  {
    name: 'Sut-Daman & Dupta',
    value: 'Sut-Daman & Dupta',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
  },
  {
    name: 'Choli & Blouse',
    value: 'Choli & Blouse',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200&h=200&fit=crop',
  },
  {
    name: 'Buta',
    value: 'Buta',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop',
  },
  {
    name: 'Buti Small',
    value: 'Buti Small',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&h=200&fit=crop',
  },
  {
    name: 'Kli-Lengha',
    value: 'Kli-Lengha',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=200&h=200&fit=crop',
  },
  {
    name: 'C Pallu',
    value: 'C Pallu',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
  },
  {
    name: 'Lace',
    value: 'Lace',
    image: 'https://images.unsplash.com/photo-1502740479091-635887520276?w=200&h=200&fit=crop',
  },
  {
    name: 'Figar Design',
    value: 'Figar Design',
    image: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=200&h=200&fit=crop',
  },
  {
    name: 'No Panching',
    value: 'No Panching',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  }
];

const ALL_CORDING_SUBCATEGORIES_VALUES = [
  'Cording Design',
  'Lengha-Kli',
  'Choli',
  'Gala & Servani',
  'Garment & Jal',
  'Daman',
  'Lace',
  'C Pallu',
  'Dual-Cording Sq',
  'Figar Design',
  'Buta',
  'Blouse',
  'Dupta-Only',
  'Buti',
  'No Panching'
];

const CORDING_SUBCATEGORIES = [
  {
    name: 'All Cording',
    value: 'Cording Design',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&h=200&fit=crop',
  },
  {
    name: 'Lengha-Kli',
    value: 'Lengha-Kli',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=200&h=200&fit=crop',
  },
  {
    name: 'Choli',
    value: 'Choli',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200&h=200&fit=crop',
  },
  {
    name: 'Gala & Servani',
    value: 'Gala & Servani',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
  },
  {
    name: 'Garment & Jal',
    value: 'Garment & Jal',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=200&h=200&fit=crop',
  },
  {
    name: 'Daman',
    value: 'Daman',
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=200&h=200&fit=crop',
  },
  {
    name: 'Lace',
    value: 'Lace',
    image: 'https://images.unsplash.com/photo-1502740479091-635887520276?w=200&h=200&fit=crop',
  },
  {
    name: 'C Pallu',
    value: 'C Pallu',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop',
  },
  {
    name: 'Dual-Cording Sq',
    value: 'Dual-Cording Sq',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  },
  {
    name: 'Figar Design',
    value: 'Figar Design',
    image: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=200&h=200&fit=crop',
  },
  {
    name: 'Buta',
    value: 'Buta',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop',
  },
  {
    name: 'Blouse',
    value: 'Blouse',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
  },
  {
    name: 'Dupta-Only',
    value: 'Dupta-Only',
    image: 'https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=200&h=200&fit=crop',
  },
  {
    name: 'Buti',
    value: 'Buti',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200&h=200&fit=crop',
  },
  {
    name: 'No Panching',
    value: 'No Panching',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  }
];

const ALL_CHAIN_SUBCATEGORIES_VALUES = [
  'Chain Design',
  'Pallu-Scat',
  'Patli & Kli',
  'Gala & Nack',
  'Garment & Jal',
  'Penal-Patta',
  'Figar Design',
  'Buta',
  'C Pallu',
  'Blouse',
  'No Panching'
];

const CHAIN_SUBCATEGORIES = [
  {
    name: 'All Chain',
    value: 'Chain Design',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&h=200&fit=crop',
  },
  {
    name: 'Pallu-Scat',
    value: 'Pallu-Scat',
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=200&h=200&fit=crop',
  },
  {
    name: 'Patli & Kli',
    value: 'Patli & Kli',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
  },
  {
    name: 'Gala & Nack',
    value: 'Gala & Nack',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200&h=200&fit=crop',
  },
  {
    name: 'Garment & Jal',
    value: 'Garment & Jal',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200&h=200&fit=crop',
  },
  {
    name: 'Penal-Patta',
    value: 'Penal-Patta',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&h=200&fit=crop',
  },
  {
    name: 'Figar Design',
    value: 'Figar Design',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=200&h=200&fit=crop',
  },
  {
    name: 'Buta',
    value: 'Buta',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
  },
  {
    name: 'C Pallu',
    value: 'C Pallu',
    image: 'https://images.unsplash.com/photo-1502740479091-635887520276?w=200&h=200&fit=crop',
  },
  {
    name: 'Blouse',
    value: 'Blouse',
    image: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?w=200&h=200&fit=crop',
  },
  {
    name: 'No Panching',
    value: 'No Panching',
    image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=200&h=200&fit=crop',
  }
];

const ALL_BEADS_SUBCATEGORIES_VALUES = [
  'Beads Design',
  'Kli Beads Design',
  'C-Pallu Beads Design',
  'Daman Beads Design',
  'Gala beads Design'
];

const BEADS_SUBCATEGORIES = [
  {
    name: 'All Beads',
    value: 'Beads Design',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=200&h=200&fit=crop',
  },
  {
    name: 'Kli Beads Design',
    value: 'Kli Beads Design',
    image: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=200&h=200&fit=crop',
  },
  {
    name: 'C-Pallu Beads Design',
    value: 'C-Pallu Beads Design',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200&h=200&fit=crop',
  },
  {
    name: 'Daman Beads Design',
    value: 'Daman Beads Design',
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=200&h=200&fit=crop',
  },
  {
    name: 'Gala beads Design',
    value: 'Gala beads Design',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
  }
];



const getSubcategoryDisplayName = (sub: string) => {
  if (sub.startsWith('Lehengha - ')) return sub.replace('Lehengha - ', '');
  if (sub.startsWith('Suit - ')) return sub.replace('Suit - ', '');
  if (sub.startsWith('Dupatta - ')) return sub.replace('Dupatta - ', '');
  if (sub.startsWith('Mekhena + Chadar - ')) return sub.replace('Mekhena + Chadar - ', '');
  return sub;
};

const renderSubcategoryLink = (
  sub: { name: string; value: string; image: string },
  index: number,
  currentCategory: string,
  currentSubcategory: string,
  showAll: boolean
) => {
  const isActive = sub.name.startsWith('All') 
    ? (currentSubcategory === sub.value && showAll) 
    : (currentSubcategory === sub.value);
  const isAll = sub.name.startsWith('All');

  const colors = [
    'bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]',
    'bg-[#FFE4E6] text-[#9F1239] border-[#FECDD3]',
    'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]',
    'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
    'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]',
    'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
    'bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]',
    'bg-[#FCE7F3] text-[#9D174D] border-[#FBCFE8]',
    'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    'bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA]',
    'bg-[#F5F5F5] text-[#171717] border-[#E5E5E5]',
  ];
  const colorClass = colors[index % colors.length];
  const displayName = sub.name.replace(/\s*design\s*/gi, '');

  return (
    <Link
      key={sub.value}
      to={`/collection?category=${encodeURIComponent(currentCategory)}&subcategory=${encodeURIComponent(sub.value)}${isAll ? '&showAll=true' : ''}`}
      className="flex flex-col items-center group focus:outline-none w-full md:w-28"
    >
      <div className={`w-full max-w-[96px] sm:max-w-[112px] aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-300 mx-auto ${
        isActive 
          ? 'border-primary ring-4 ring-primary/20 scale-105 shadow-md' 
          : 'border-on-surface/80 group-hover:border-primary group-hover:scale-102'
      }`}>
        {isAll ? (
          <img 
            src={sub.image} 
            alt={sub.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center p-2 text-center transition-colors duration-300 ${colorClass}`}>
            <span className="text-[12px] sm:text-[14px] font-extrabold tracking-normal leading-snug uppercase select-none px-1.5 text-center">
              {displayName}
            </span>
          </div>
        )}
      </div>
      {isAll && (
        <span className={`mt-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-center max-w-full transition-colors leading-tight ${
          isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
        }`}>
          {displayName}
        </span>
      )}
    </Link>
  );
};

export function CollectionPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'All';
  const subcategory = searchParams.get('subcategory') || 'All';
  const showAll = searchParams.get('showAll') === 'true';

  const designTypes = category === 'Weaving Design' ? WEAVING_DESIGN_TYPES : EMB_DESIGN_TYPES;
  const areas = category === 'Weaving Design' ? WEAVING_AREAS : EMB_AREAS;
  const needles = category === 'Weaving Design' ? ['All', '36 to 42', '43 to 48', '50 to 60', '61 to 70', '71 to 80', '80 to 90'] : ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const formats = category === 'Weaving Design' ? WEAVING_FORMATS : DESIGN_FORMATS;
  const concepts = category === 'Weaving Design' ? WEAVING_CONCEPTS : SAREE_CONCEPTS;

  const { showToast } = useNotification();
  const [showFilters, setShowFilters] = useState(true);
  const [openFilters, setOpenFilters] = useState(() => {
    const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
    return {
      designType: isDesktop,
      area: isDesktop,
      needle: isDesktop,
      designFormat: isDesktop,
      sareeConcept: isDesktop,
    };
  });

  const toggleFilter = (key: keyof typeof openFilters) => {
    setOpenFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const [selectedDesignType, setSelectedDesignType] = useState('All');
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedNeedle, setSelectedNeedle] = useState('All');
  const [selectedDesignFormat, setSelectedDesignFormat] = useState('All');
  const [selectedSareeConcept, setSelectedSareeConcept] = useState('All');
  const [sortOption, setSortOption] = useState('Newest Arrivals');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Map sort labels to backend values
  const getBackendSort = (label: string) => {
    switch (label) {
      case 'Newest Arrivals': return 'newest';
      case 'Price: Low to High': return 'price_asc';
      case 'Price: High to Low': return 'price_desc';
      case 'Recommended':
      default: return 'rating';
    }
  };

  const fetchDesigns = async () => {
    if (['Saree Design', 'Lehengha Design', 'Suit Design', 'Dupatta Design', 'Mekhena + Chadar Design', 'Multi Design', 'Sequin Design', 'Cording Design', 'Chain Design', 'Beads Design'].includes(subcategory) && !showAll) {
      setDesigns([]);
      setTotalPages(1);
      setTotalResults(0);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 9,
        sort: getBackendSort(sortOption),
      };

      if (category !== 'All') params.category = category;
      if (subcategory !== 'All') params.subcategory = subcategory;
      if (selectedDesignType !== 'All') params.designType = selectedDesignType;
      if (selectedArea !== 'All' && category !== 'Digital Print Design' && category !== 'Position Print Design') params.area = selectedArea;
      if (selectedNeedle !== 'All' && category !== 'Digital Print Design' && category !== 'Position Print Design') params.needle = selectedNeedle;
      if (selectedDesignFormat !== 'All') params.designFormat = selectedDesignFormat;
      if (selectedSareeConcept !== 'All') params.sareeConcept = selectedSareeConcept;

      const response = await api.designs.getAll(params);
      setDesigns(response.designs);
      setTotalPages(response.pages);
      setTotalResults(response.total);
    } catch (error) {
      console.error('Failed to fetch designs:', error);
      showToast('Error loading designs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, [category, subcategory, selectedDesignType, selectedArea, selectedNeedle, selectedDesignFormat, selectedSareeConcept, sortOption, currentPage, showAll]);

  const handleClearAll = () => {
    setSelectedDesignType('All');
    setSelectedArea('All');
    setSelectedNeedle('All');
    setSelectedDesignFormat('All');
    setSelectedSareeConcept('All');
    setSortOption('Newest Arrivals');
    setCurrentPage(1);
  };

  const getParentSubcategory = (sub: string): string => {
    if (ALL_SAREE_SUBCATEGORIES_VALUES.includes(sub)) return 'Saree Design';
    if (ALL_LEHENGHA_SUBCATEGORIES_VALUES.includes(sub)) return 'Lehengha Design';
    if (ALL_SUIT_SUBCATEGORIES_VALUES.includes(sub)) return 'Suit Design';
    if (ALL_DUPATTA_SUBCATEGORIES_VALUES.includes(sub)) return 'Dupatta Design';
    if (ALL_MEKHENA_CHADAR_SUBCATEGORIES_VALUES.includes(sub)) return 'Mekhena + Chadar Design';
    if (ALL_MULTI_SUBCATEGORIES_VALUES.includes(sub)) return 'Multi Design';
    if (ALL_SEQUIN_SUBCATEGORIES_VALUES.includes(sub)) return 'Sequin Design';
    if (ALL_CORDING_SUBCATEGORIES_VALUES.includes(sub)) return 'Cording Design';
    if (ALL_CHAIN_SUBCATEGORIES_VALUES.includes(sub)) return 'Chain Design';
    if (ALL_BEADS_SUBCATEGORIES_VALUES.includes(sub)) return 'Beads Design';
    return 'All';
  };

  const getBackNavigation = () => {
    if (showAll && subcategory !== 'All') {
      const parentSub = getParentSubcategory(subcategory);
      if (parentSub !== 'All') {
        return {
          to: `/collection?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(parentSub)}`,
          text: `Back to ${getSubcategoryDisplayName(parentSub)}`
        };
      }
    }
    
    if (subcategory !== 'All') {
      return {
        to: `/?category=${encodeURIComponent(category)}`,
        text: `Back to ${category}`
      };
    }
    
    return {
      to: '/',
      text: 'Back to Marketplace'
    };
  };

  const backNav = getBackNavigation();

  return (
    <div className="bg-surface min-h-screen pb-24">
      {/* Header */}
      <div className="bg-primary pt-12 pb-20 px-6 md:px-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-[1440px] mx-auto relative z-10">
          <Link to={backNav.to} className="inline-flex items-center gap-2 text-primary-fixed-dim hover:text-white font-semibold mb-6 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            {backNav.text}
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {subcategory !== 'All' ? getSubcategoryDisplayName(subcategory) : category}
          </h1>
          <p className="text-primary-fixed-dim text-lg">
            Showing designs under {category}{' '}
            {subcategory !== 'All' && (
              <>
                &gt;{' '}
                {showAll ? (
                  <Link 
                    to={`/collection?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`}
                    className="underline hover:text-white font-semibold transition-colors"
                  >
                    {getSubcategoryDisplayName(subcategory)}
                  </Link>
                ) : (
                  getSubcategoryDisplayName(subcategory)
                )}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-10 mt-10">
        {/* Saree Subcategories Visual Bar */}
        {category === 'Weaving Design' && subcategory === 'Saree Design' && !showAll && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-outline-variant animate-fade-in max-w-6xl mx-auto">
            <h3 className="text-lg font-bold text-on-surface text-center mb-6 uppercase tracking-wider">Saree Subcategories</h3>
            <div className="grid grid-cols-3 gap-3.5 sm:gap-6 justify-center md:flex md:flex-wrap md:justify-center md:gap-8">
              {SAREE_SUBCATEGORIES.map((sub, index) => renderSubcategoryLink(sub, index, 'Weaving Design', subcategory, showAll))}
            </div>
          </div>
        )}

        {/* Lehengha Subcategories Visual Bar */}
        {category === 'Weaving Design' && subcategory === 'Lehengha Design' && !showAll && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-outline-variant animate-fade-in max-w-5xl mx-auto">
            <h3 className="text-lg font-bold text-on-surface text-center mb-6 uppercase tracking-wider">Lehengha Subcategories</h3>
            <div className="grid grid-cols-3 gap-3.5 sm:gap-6 justify-center md:flex md:flex-wrap md:justify-center md:gap-8">
              {LEHENGHA_SUBCATEGORIES.map((sub, index) => renderSubcategoryLink(sub, index, 'Weaving Design', subcategory, showAll))}
            </div>
          </div>
        )}

        {/* Suit Subcategories Visual Bar */}
        {category === 'Weaving Design' && subcategory === 'Suit Design' && !showAll && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-outline-variant animate-fade-in max-w-5xl mx-auto">
            <h3 className="text-lg font-bold text-on-surface text-center mb-6 uppercase tracking-wider">Suit Subcategories</h3>
            <div className="grid grid-cols-3 gap-3.5 sm:gap-6 justify-center md:flex md:flex-wrap md:justify-center md:gap-8">
              {SUIT_SUBCATEGORIES.map((sub, index) => renderSubcategoryLink(sub, index, 'Weaving Design', subcategory, showAll))}
            </div>
          </div>
        )}

        {/* Dupatta Subcategories Visual Bar */}
        {category === 'Weaving Design' && subcategory === 'Dupatta Design' && !showAll && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-outline-variant animate-fade-in max-w-6xl mx-auto">
            <h3 className="text-lg font-bold text-on-surface text-center mb-6 uppercase tracking-wider">Dupatta Subcategories</h3>
            <div className="grid grid-cols-3 gap-3.5 sm:gap-6 justify-center md:flex md:flex-wrap md:justify-center md:gap-8">
              {DUPATTA_SUBCATEGORIES.map((sub, index) => renderSubcategoryLink(sub, index, 'Weaving Design', subcategory, showAll))}
            </div>
          </div>
        )}

        {/* Mekhena + Chadar Subcategories Visual Bar */}
        {category === 'Weaving Design' && subcategory === 'Mekhena + Chadar Design' && !showAll && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-outline-variant animate-fade-in max-w-6xl mx-auto">
            <h3 className="text-lg font-bold text-on-surface text-center mb-6 uppercase tracking-wider">Mekhena + Chadar Subcategories</h3>
            <div className="grid grid-cols-3 gap-3.5 sm:gap-6 justify-center md:flex md:flex-wrap md:justify-center md:gap-8">
              {MEKHENA_CHADAR_SUBCATEGORIES.map((sub, index) => renderSubcategoryLink(sub, index, 'Weaving Design', subcategory, showAll))}
            </div>
          </div>
        )}

        {/* Multi Subcategories Visual Bar */}
        {category === 'Embroidery Design' && subcategory === 'Multi Design' && !showAll && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-outline-variant animate-fade-in max-w-5xl mx-auto">
            <h3 className="text-lg font-bold text-on-surface text-center mb-6 uppercase tracking-wider">Multi Subcategories</h3>
            <div className="grid grid-cols-3 gap-3.5 sm:gap-6 justify-center md:flex md:flex-wrap md:justify-center md:gap-8">
              {MULTI_SUBCATEGORIES.map((sub, index) => renderSubcategoryLink(sub, index, 'Embroidery Design', subcategory, showAll))}
            </div>
          </div>
        )}

        {/* Sequin Subcategories Visual Bar */}
        {category === 'Embroidery Design' && subcategory === 'Sequin Design' && !showAll && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-outline-variant animate-fade-in max-w-5xl mx-auto">
            <h3 className="text-lg font-bold text-on-surface text-center mb-6 uppercase tracking-wider">Sequin Subcategories</h3>
            <div className="grid grid-cols-3 gap-3.5 sm:gap-6 justify-center md:flex md:flex-wrap md:justify-center md:gap-8">
              {SEQUIN_SUBCATEGORIES.map((sub, index) => renderSubcategoryLink(sub, index, 'Embroidery Design', subcategory, showAll))}
            </div>
          </div>
        )}

        {/* Cording Subcategories Visual Bar */}
        {category === 'Embroidery Design' && subcategory === 'Cording Design' && !showAll && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-outline-variant animate-fade-in max-w-6xl mx-auto">
            <h3 className="text-lg font-bold text-on-surface text-center mb-6 uppercase tracking-wider">Cording Subcategories</h3>
            <div className="grid grid-cols-3 gap-3.5 sm:gap-6 justify-center md:flex md:flex-wrap md:justify-center md:gap-8">
              {CORDING_SUBCATEGORIES.map((sub, index) => renderSubcategoryLink(sub, index, 'Embroidery Design', subcategory, showAll))}
            </div>
          </div>
        )}

        {/* Chain Subcategories Visual Bar */}
        {category === 'Embroidery Design' && subcategory === 'Chain Design' && !showAll && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-outline-variant animate-fade-in max-w-6xl mx-auto">
            <h3 className="text-lg font-bold text-on-surface text-center mb-6 uppercase tracking-wider">Chain Subcategories</h3>
            <div className="grid grid-cols-3 gap-3.5 sm:gap-6 justify-center md:flex md:flex-wrap md:justify-center md:gap-8">
              {CHAIN_SUBCATEGORIES.map((sub, index) => renderSubcategoryLink(sub, index, 'Embroidery Design', subcategory, showAll))}
            </div>
          </div>
        )}

        {/* Beads Subcategories Visual Bar */}
        {category === 'Embroidery Design' && subcategory === 'Beads Design' && !showAll && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-8 border border-outline-variant animate-fade-in max-w-5xl mx-auto">
            <h3 className="text-lg font-bold text-on-surface text-center mb-6 uppercase tracking-wider">Beads Subcategories</h3>
            <div className="grid grid-cols-3 gap-3.5 sm:gap-6 justify-center md:flex md:flex-wrap md:justify-center md:gap-8">
              {BEADS_SUBCATEGORIES.map((sub, index) => renderSubcategoryLink(sub, index, 'Embroidery Design', subcategory, showAll))}
            </div>
          </div>
        )}



        {(!['Saree Design', 'Lehengha Design', 'Suit Design', 'Dupatta Design', 'Mekhena + Chadar Design', 'Multi Design', 'Sequin Design', 'Cording Design', 'Chain Design', 'Beads Design'].includes(subcategory) || showAll) && (isLoading || !(designs.length === 0 && 
                         selectedDesignType === 'All' && 
                         selectedArea === 'All' && 
                         selectedNeedle === 'All' && 
                         selectedDesignFormat === 'All' && 
                         selectedSareeConcept === 'All')) && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Advanced Filters Sidebar */}
          {showFilters && (
            <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24 space-y-4">


              {/* 1. Design Types */}
              <div className="border border-outline-variant/60 bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                <button 
                  onClick={() => toggleFilter('designType')}
                  className="w-full flex justify-between items-center px-4 py-3.5 hover:bg-surface-container-lowest/50 transition-colors text-left"
                >
                  <span className="font-bold text-xs text-primary uppercase tracking-wider">Design Types (machines types)</span>
                  <span className={`material-symbols-outlined text-primary/80 transition-transform duration-200 ${openFilters.designType ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                  </span>
                </button>
                {openFilters.designType && (
                  <>
                    <div className="w-full h-px bg-outline-variant/50"></div>
                    <div className="px-4 py-3.5 bg-white custom-filter-scroll max-h-[185px] overflow-y-auto space-y-2.5">
                      {designTypes.map(type => (
                        <label key={type} className="flex items-center gap-3 cursor-pointer group text-sm font-medium">
                          <input 
                            type="radio" 
                            name="designType"
                            checked={selectedDesignType === type}
                            onChange={() => { setSelectedDesignType(type); setCurrentPage(1); }}
                            className="w-4 h-4 accent-primary cursor-pointer" 
                          />
                          <span className={`transition-colors ${selectedDesignType === type ? 'text-primary font-semibold' : 'text-on-surface-variant group-hover:text-primary'}`}>{type}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 2. Area (Reed & Pick for Weaving Design) */}
              {category !== 'Digital Print Design' && category !== 'Position Print Design' && (
                <>
                  <div className="border border-outline-variant/60 bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                    <button 
                      onClick={() => toggleFilter('area')}
                      className="w-full flex justify-between items-center px-4 py-3.5 hover:bg-surface-container-lowest/50 transition-colors text-left"
                    >
                      <span className="font-bold text-xs text-primary uppercase tracking-wider">
                        {category === 'Weaving Design' ? 'Reed' : 'Area'}
                      </span>
                      <span className={`material-symbols-outlined text-primary/80 transition-transform duration-200 ${openFilters.area ? 'rotate-180' : ''}`}>
                        keyboard_arrow_down
                      </span>
                    </button>
                    {openFilters.area && (
                      <>
                        <div className="w-full h-px bg-outline-variant/50"></div>
                        <div className="px-4 py-3.5 bg-white custom-filter-scroll max-h-[185px] overflow-y-auto space-y-2.5">
                          {areas.map(ar => (
                            <label key={ar} className="flex items-center gap-3 cursor-pointer group text-sm font-medium">
                              <input 
                                type="radio" 
                                name="area"
                                checked={selectedArea === ar}
                                onChange={() => { setSelectedArea(ar); setCurrentPage(1); }}
                                className="w-4 h-4 accent-primary cursor-pointer" 
                              />
                              <span className={`transition-colors ${selectedArea === ar ? 'text-primary font-semibold' : 'text-on-surface-variant group-hover:text-primary'}`}>{ar}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* 3. Needle / Color */}
                  <div className="border border-outline-variant/60 bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                    <button 
                      onClick={() => toggleFilter('needle')}
                      className="w-full flex justify-between items-center px-4 py-3.5 hover:bg-surface-container-lowest/50 transition-colors text-left"
                    >
                      <span className="font-bold text-xs text-primary uppercase tracking-wider">
                        {category === 'Weaving Design' ? 'Pick' : 'Needle'}
                      </span>
                      <span className={`material-symbols-outlined text-primary/80 transition-transform duration-200 ${openFilters.needle ? 'rotate-180' : ''}`}>
                        keyboard_arrow_down
                      </span>
                    </button>
                    {openFilters.needle && (
                      <>
                        <div className="w-full h-px bg-outline-variant/50"></div>
                        <div className="px-4 py-3.5 bg-white custom-filter-scroll max-h-[185px] overflow-y-auto space-y-2.5">
                          {needles.map(n => (
                            <label key={n} className="flex items-center gap-3 cursor-pointer group text-sm font-medium">
                              <input 
                                type="radio" 
                                name="needle"
                                checked={selectedNeedle === n}
                                onChange={() => { setSelectedNeedle(n); setCurrentPage(1); }}
                                className="w-4 h-4 accent-primary cursor-pointer" 
                              />
                              <span className={`transition-colors ${selectedNeedle === n ? 'text-primary font-semibold' : 'text-on-surface-variant group-hover:text-primary'}`}>{n}</span>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {/* 4. Design Format */}
              <div className="border border-outline-variant/60 bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                <button 
                  onClick={() => toggleFilter('designFormat')}
                  className="w-full flex justify-between items-center px-4 py-3.5 hover:bg-surface-container-lowest/50 transition-colors text-left"
                >
                  <span className="font-bold text-xs text-primary uppercase tracking-wider">Design Format</span>
                  <span className={`material-symbols-outlined text-primary/80 transition-transform duration-200 ${openFilters.designFormat ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                  </span>
                </button>
                {openFilters.designFormat && (
                  <>
                    <div className="w-full h-px bg-outline-variant/50"></div>
                    <div className="px-4 py-3.5 bg-white custom-filter-scroll max-h-[185px] overflow-y-auto space-y-2.5">
                      {formats.map(f => (
                        <label key={f} className="flex items-center gap-3 cursor-pointer group text-sm font-medium">
                          <input 
                            type="radio" 
                            name="designFormat"
                            checked={selectedDesignFormat === f}
                            onChange={() => { setSelectedDesignFormat(f); setCurrentPage(1); }}
                            className="w-4 h-4 accent-primary cursor-pointer" 
                          />
                          <span className={`transition-colors ${selectedDesignFormat === f ? 'text-primary font-semibold' : 'text-on-surface-variant group-hover:text-primary'}`}>{f}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 5. Saree Concept */}
              <div className="border border-outline-variant/60 bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200">
                <button 
                  onClick={() => toggleFilter('sareeConcept')}
                  className="w-full flex justify-between items-center px-4 py-3.5 hover:bg-surface-container-lowest/50 transition-colors text-left"
                >
                  <span className="font-bold text-xs text-primary uppercase tracking-wider">
                    {category === 'Weaving Design' ? 'Design Concept' : 'Saree Concept'}
                  </span>
                  <span className={`material-symbols-outlined text-primary/80 transition-transform duration-200 ${openFilters.sareeConcept ? 'rotate-180' : ''}`}>
                    keyboard_arrow_down
                  </span>
                </button>
                {openFilters.sareeConcept && (
                  <>
                    <div className="w-full h-px bg-outline-variant/50"></div>
                    <div className="px-4 py-3.5 bg-white custom-filter-scroll max-h-[185px] overflow-y-auto space-y-2.5">
                      {concepts.map(sc => (
                        <label key={sc} className="flex items-center gap-3 cursor-pointer group text-sm font-medium">
                          <input 
                            type="radio" 
                            name="sareeConcept"
                            checked={selectedSareeConcept === sc}
                            onChange={() => { setSelectedSareeConcept(sc); setCurrentPage(1); }}
                            className="w-4 h-4 accent-primary cursor-pointer" 
                          />
                          <span className={`transition-colors ${selectedSareeConcept === sc ? 'text-primary font-semibold' : 'text-on-surface-variant group-hover:text-primary'}`}>{sc}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </aside>
          )}

          {/* Design Grid */}
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center mb-6">
              <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                <p className="text-sm font-semibold text-on-surface-variant">Showing <span className="text-primary">{totalResults}</span> results</p>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-surface-variant text-on-surface rounded-xl font-semibold text-xs sm:text-sm hover:bg-outline-variant/30 transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px] sm:text-[20px]">tune</span>
                  <span>{showFilters ? 'Hide Filters' : 'Filters'}</span>
                </button>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t border-outline-variant/30 pt-3 sm:border-t-0 sm:pt-0">
                <span className="text-sm text-on-surface-variant">Sort by:</span>
                <select 
                  value={sortOption}
                  onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent border-none text-sm font-semibold text-primary focus:outline-none cursor-pointer"
                >
                  <option>Newest Arrivals</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20 w-full">
                <div className="w-12 h-12 border-4 border-outline-variant border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : designs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                {designs.map(design => (
                  <DesignCard key={design.id} design={design} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-outline-variant border-dashed">
                <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-outline">
                  <span className="material-symbols-outlined text-[32px]">search_off</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-2">No designs found</h3>
                <p className="text-on-surface-variant mb-6">Try adjusting your filters to find what you're looking for.</p>
                <button 
                  onClick={handleClearAll}
                  className="px-6 py-2 bg-primary-container text-white rounded-lg font-semibold hover:bg-primary transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
            
            {/* Pagination */}
            {designs.length > 0 && totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button 
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center shadow-sm transition-colors ${
                        currentPage === page ? 'bg-primary text-white' : 'border border-outline-variant text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-lg border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

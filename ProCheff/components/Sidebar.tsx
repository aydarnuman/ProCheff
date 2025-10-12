

import React, { useState, useMemo, useEffect } from 'react';
import { ActiveTab } from '../types';
import Icon from './Icon';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const NavItem: React.FC<{
  tab: ActiveTab;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  icon: React.ReactNode;
  label: string;
  isSubItem?: boolean;
}> = ({ tab, activeTab, setActiveTab, icon, label, isSubItem = false }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        setActiveTab(tab);
      }}
      className={`nav-item ${activeTab === tab ? 'active' : ''} ${isSubItem ? 'sub-item' : ''}`}
    >
      <span className="nav-item-icon">{icon}</span>
      <span className="nav-item-label">{label}</span>
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, theme, onToggleTheme }) => {
  const menuManagementTabs = useMemo(() => [ActiveTab.Plan, ActiveTab.AiMenuPlanner, ActiveTab.Recipes], []);
  const settingsTabs = useMemo(() => [ActiveTab.SettingsIntelligence, ActiveTab.SettingsApi, ActiveTab.SettingsGeneral], []);
  
  const isMenuManagementGroupActive = useMemo(() => menuManagementTabs.includes(activeTab), [activeTab, menuManagementTabs]);
  const isSettingsGroupActive = useMemo(() => settingsTabs.includes(activeTab), [activeTab, settingsTabs]);
  
  const [isMenuManagementOpen, setMenuManagementOpen] = useState(isMenuManagementGroupActive);
  const [isSettingsOpen, setSettingsOpen] = useState(isSettingsGroupActive);

  useEffect(() => {
    if (isMenuManagementGroupActive) setMenuManagementOpen(true);
  }, [isMenuManagementGroupActive]);
  
  useEffect(() => {
    if (isSettingsGroupActive) setSettingsOpen(true);
  }, [isSettingsGroupActive]);

  return (
    <aside className="w-60" aria-label="Sidebar">
      <div className="sidebar-container">
        <div className="sidebar-header">
           <Icon name="logo" className="h-7 w-7 mr-2 text-emerald-400" />
           <span className="sidebar-title">MaliyetŞef</span>
        </div>
        
        <ul className="sidebar-nav">
          <NavItem 
            tab={ActiveTab.Dashboard} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            icon={<Icon name="dashboard" />} 
            label="Kontrol Paneli" 
          />
          
          <li className="my-2 border-t border-gray-700 opacity-50"></li>

          {/* Collapsible Menu Management Group */}
          <li>
            <button
              className={`collapsible-header ${isMenuManagementGroupActive ? 'active-group' : ''}`}
              onClick={() => setMenuManagementOpen(!isMenuManagementOpen)}
              aria-expanded={isMenuManagementOpen}
            >
              <span className="nav-item-icon"><Icon name="archive-box" /></span>
              <span className="nav-item-label">Menü Yönetimi</span>
              <Icon name="chevron-down" className="chevron" />
            </button>
            <div className={`submenu ${isMenuManagementOpen ? 'open' : ''}`}>
              <ul className="space-y-1 py-1">
                <NavItem 
                  tab={ActiveTab.Plan} 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  icon={<Icon name="plan" />} 
                  label="Planlama & Maliyet" 
                  isSubItem={true}
                />
                <NavItem 
                  tab={ActiveTab.AiMenuPlanner} 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  icon={<Icon name="gemini" className="text-purple-400" />}
                  label="Menü Planlama" 
                  isSubItem={true}
                />
                <NavItem 
                  tab={ActiveTab.Recipes} 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  icon={<Icon name="recipes" />} 
                  label="Tarif Kütüphanesi" 
                  isSubItem={true}
                />
              </ul>
            </div>
          </li>
          
          <li className="my-2 border-t border-gray-700 opacity-50"></li>
          
          <NavItem 
            tab={ActiveTab.Prices} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            icon={<Icon name="prices" />} 
            label="Fiyat Listesi" 
          />

          <li className="my-2 border-t border-gray-700 opacity-50"></li>

          {/* Collapsible Settings Group */}
          <li>
            <button
              className={`collapsible-header ${isSettingsGroupActive ? 'active-group' : ''}`}
              onClick={() => setSettingsOpen(!isSettingsOpen)}
              aria-expanded={isSettingsOpen}
            >
              <span className="nav-item-icon"><Icon name="settings" /></span>
              <span className="nav-item-label">Ayarlar</span>
              <Icon name="chevron-down" className="chevron" />
            </button>
            <div className={`submenu ${isSettingsOpen ? 'open' : ''}`}>
              <ul className="space-y-1 py-1">
                <NavItem 
                  tab={ActiveTab.SettingsIntelligence} 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  icon={<Icon name="brain" />} 
                  label="Zeka Merkezi" 
                  isSubItem={true}
                />
                <NavItem 
                  tab={ActiveTab.SettingsApi} 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  icon={<Icon name="plug" />}
                  label="API Kaynakları" 
                  isSubItem={true}
                />
                <NavItem 
                  tab={ActiveTab.SettingsGeneral} 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  icon={<Icon name="settings" />} 
                  label="Genel Ayarlar" 
                  isSubItem={true}
                />
              </ul>
            </div>
          </li>

        </ul>
        
        <div className="sidebar-footer">
            <button onClick={onToggleTheme} className="user-item w-full">
                <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-5 h-5"/>
                <span>{theme === 'dark' ? 'Açık Mod' : 'Koyu Mod'}</span>
            </button>
            <a href="#" className="user-item">
                <Icon name="logout" className="w-5 h-5"/>
                <span>Çıkış</span>
            </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
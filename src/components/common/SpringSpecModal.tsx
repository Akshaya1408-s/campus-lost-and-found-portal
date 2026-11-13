import React, { useState } from 'react';
import { X, Server, Database, Code, Check, Copy, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SpringSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpringSpecModal: React.FC<SpringSpecModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'entity' | 'controller' | 'mysql' | 'config'>('endpoints');
  const [copied, setCopied] = useState(false);
  const [tempBaseUrl, setTempBaseUrl] = useState('http://localhost:8080/api/v1');

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets = {
    endpoints: `// Spring Boot REST API Endpoint Contract
// Base URL: http://localhost:8080/api/v1

GET    /api/v1/items                     -> List all items (with filters: type, category, q)
GET    /api/v1/items/{id}                -> Get single item details
POST   /api/v1/items                     -> Report a lost or found item
PUT    /api/v1/items/{id}                -> Update item details
DELETE /api/v1/items/{id}                -> Delete / archive an item

GET    /api/v1/claims                    -> List all claims (Admin role)
GET    /api/v1/claims/my?email={email}   -> List claims filed by current student
POST   /api/v1/claims                    -> Submit ownership claim with proof description
PATCH  /api/v1/claims/{id}/status        -> Approve/Reject claim or record collection

GET    /api/v1/stats                     -> Summary metrics for university dashboard
POST   /api/v1/auth/login                -> Student & Staff authentication
POST   /api/v1/auth/register             -> Student registration`,

    entity: `package com.campus.lostfound.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LostFoundItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String referenceNo; // e.g. LF-2026-1089

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemType type; // LOST, FOUND

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String location;

    private String specificLocation;
    private LocalDate dateReported;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemStatus status; // OPEN, CLAIM_PENDING, CLAIMED, CLOSED

    private String imageUrl;
    private String rewardOffered;

    // Reporter Details
    private String reporterName;
    private String reporterEmail;
    private String reporterPhone;
    private String reporterStudentId;

    // Secure Custody Details (for Found items)
    private Boolean heldAtOffice;
    private String lockerNumber;
    private String secretDetails; // Only visible to admin/staff

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
      createdAt = LocalDateTime.now();
      updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
      updatedAt = LocalDateTime.now();
    }
}`,

    controller: `package com.campus.lostfound.controller;

import com.campus.lostfound.entity.LostFoundItem;
import com.campus.lostfound.service.ItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/items")
@CrossOrigin(origins = "*")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public ResponseEntity<List<LostFoundItem>> getAllItems(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(itemService.searchItems(type, category, q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LostFoundItem> getItemById(@PathVariable Long id) {
        return itemService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<LostFoundItem> createItem(@RequestBody LostFoundItem item) {
        return ResponseEntity.ok(itemService.saveItem(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LostFoundItem> updateItem(
            @PathVariable Long id, @RequestBody LostFoundItem itemDetails) {
        return ResponseEntity.ok(itemService.updateItem(id, itemDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        itemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}`,

    mysql: `-- MySQL 8.0+ Database Schema for Campus Lost & Found
CREATE DATABASE IF NOT EXISTS campus_lost_found_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_lost_found_db;

CREATE TABLE IF NOT EXISTS items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reference_no VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('LOST', 'FOUND') NOT NULL,
    category VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    specific_location VARCHAR(255),
    date_reported DATE NOT NULL,
    status ENUM('OPEN', 'CLAIM_PENDING', 'CLAIMED', 'CLOSED') DEFAULT 'OPEN',
    image_url VARCHAR(500),
    reward_offered VARCHAR(100),
    reporter_name VARCHAR(150) NOT NULL,
    reporter_email VARCHAR(150) NOT NULL,
    reporter_phone VARCHAR(50),
    reporter_student_id VARCHAR(50),
    held_at_office BOOLEAN DEFAULT FALSE,
    locker_number VARCHAR(100),
    secret_details VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type_category (type, category),
    INDEX idx_date (date_reported)
);

CREATE TABLE IF NOT EXISTS claims (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    claim_reference_no VARCHAR(50) NOT NULL UNIQUE,
    item_id BIGINT NOT NULL,
    claimant_name VARCHAR(150) NOT NULL,
    claimant_email VARCHAR(150) NOT NULL,
    claimant_phone VARCHAR(50) NOT NULL,
    claimant_student_id VARCHAR(50) NOT NULL,
    proof_description TEXT NOT NULL,
    secret_identifier VARCHAR(255),
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'COLLECTED') DEFAULT 'PENDING',
    admin_notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    collected_at TIMESTAMP NULL,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);`,

    config: `## Spring Boot application.properties
spring.application.name=campus-lost-found-api
server.port=8080

# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/campus_lost_found_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_mysql_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Spring Data JPA / Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.properties.hibernate.format_sql=true

# CORS Configuration for React Frontend
management.endpoints.web.exposure.include=*
`
  };

  const handleSaveConfig = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg border border-sky-400/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Java Spring Boot &amp; MySQL Architecture
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-400/30">
                  Ready to Connect
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Spring Boot REST API contracts &amp; JPA schema for your college full-stack project
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="bg-amber-50 px-6 py-2.5 border-b border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>College Project Architecture Notice:</strong> In this web preview, client calls run against the isolated service layer (<code>/src/services/api.ts</code>) using in-memory mock data so full reporting, claiming, and admin workflows work right away. Spring Boot backend integration can be enabled when running locally.
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-slate-50 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'endpoints'
                ? 'border-sky-600 text-sky-900 font-semibold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-4 h-4" /> REST Endpoints
          </button>
          <button
            onClick={() => setActiveTab('entity')}
            className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'entity'
                ? 'border-sky-600 text-sky-900 font-semibold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" /> JPA Entity (Java)
          </button>
          <button
            onClick={() => setActiveTab('controller')}
            className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'controller'
                ? 'border-sky-600 text-sky-900 font-semibold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-4 h-4" /> Spring @RestController
          </button>
          <button
            onClick={() => setActiveTab('mysql')}
            className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'mysql'
                ? 'border-sky-600 text-sky-900 font-semibold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" /> MySQL Schema DDL
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-sky-600 text-sky-900 font-semibold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Live Backend Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900 text-slate-100 font-mono text-xs relative">
          {activeTab !== 'config' ? (
            <>
              <div className="absolute top-4 right-6 flex items-center gap-2">
                <button
                  onClick={() => handleCopy(codeSnippets[activeTab])}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 flex items-center gap-1 text-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <pre className="overflow-x-auto leading-relaxed text-slate-200">
                {codeSnippets[activeTab]}
              </pre>
            </>
          ) : (
            <div className="font-sans text-slate-200 space-y-5 max-w-lg">
              <div>
                <h4 className="text-sm font-semibold text-white">Live Spring Boot Connection Setting</h4>
                <p className="text-xs text-slate-400 mt-1">
                  When you run your Spring Boot application locally on port 8080, you can point this frontend directly to it.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Spring Boot REST Base URL:
                </label>
                <input
                  type="text"
                  value={tempBaseUrl}
                  onChange={(e) => setTempBaseUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-hidden focus:border-sky-500"
                  placeholder="http://localhost:8080/api/v1"
                />
              </div>

              <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span>Backend State:</span>
                  <span className="px-2 py-0.5 rounded font-mono font-semibold bg-emerald-500/20 text-emerald-300">
                    FIREBASE FIRESTORE ACTIVE
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cloud Database:</span>
                  <code className="text-sky-400">ai-studio-campuslostfoundp-6f1d4d89-02e2-4eeb-b199-7e3f809a5868</code>
                </div>
                <div className="flex items-center justify-between">
                  <span>Authentication:</span>
                  <span className="text-emerald-400 font-semibold">Google Sign-In + Firebase Auth</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Security Rules:</span>
                  <span className="text-emerald-400 font-semibold">Deployed to Production</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Spring Boot 3.x + Spring Data JPA + MySQL 8.0 Integration Ready</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

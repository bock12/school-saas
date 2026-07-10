import React from 'react';
import { HierarchyType } from '../types/hierarchy';
import { 
  Building2, 
  Network, 
  MapPin, 
  GraduationCap, 
  Building 
} from 'lucide-react';

export const HIERARCHY_CONFIG: Record<HierarchyType, {
  label: string;
  plural: string;
  icon: React.ElementType;
  description: string;
}> = {
  organization: {
    label: 'Organization',
    plural: 'Organizations',
    icon: Building2,
    description: 'Top-level educational institutions or governing bodies'
  },
  group: {
    label: 'Group',
    plural: 'Groups',
    icon: Network,
    description: 'Regional or structural groupings of districts/schools'
  },
  district: {
    label: 'District',
    plural: 'Districts',
    icon: MapPin,
    description: 'Geographical or administrative school districts'
  },
  school: {
    label: 'School',
    plural: 'Schools',
    icon: GraduationCap,
    description: 'Individual educational facilities'
  },
  campus: {
    label: 'Campus',
    plural: 'Campuses',
    icon: Building,
    description: 'Specific physical locations of a school'
  }
};

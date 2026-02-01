import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, Users, CheckCircle2, X, Mic, MicOff,
  Camera, CameraOff, Play, Pause, Square, BarChart3,
  MessageSquare, Star, Award, Target, TrendingUp,
  ChevronLeft, ChevronRight, Timer, AlertTriangle,
  BookOpen, Lightbulb, Zap, Brain
} from "lucide-react";
import { toast } from "sonner";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

// Types
interface InterviewSession {

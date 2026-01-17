"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    Sparkles,
    Image,
    Video,
    Type,
    Send,
    Calendar,
    Facebook,
    Instagram,
    Loader2,
    Eye,
    Trash2,
    Edit2,
    Copy,
    Wand2,
    Layout,
    Globe,
    Upload,
    X,
    ImagePlus,
    ExternalLink,
    Download,
    Share2,
    Clock,
    Target,
} from "lucide-react";

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Creative {
    _id: string;
    name: string;
    creativeType: string;
    status: string;
    content: {
        headline: string;
        description: string;
        primaryText: string;
        callToAction: string;
        language: string;
    };
    media: {
        imageUrl: string;
        videoUrl: string;
    };
    aiGenerated: {
        isAiGenerated: boolean;
        prompt: string;
    };
    usage: {
        usageType: string;
        platforms: string[];
    };
    createdAt: string;
}

export default function CreativeStudioPage() {
    const [creatives, setCreatives] = useState<Creative[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'manual' | 'ai'>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCreative, setEditingCreative] = useState<Creative | null>(null);
    const [createMode, setCreateMode] = useState<'manual' | 'ai'>('manual');
    const [generating, setGenerating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [viewingCreative, setViewingCreative] = useState<Creative | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const refImageInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        type: 'image',
        headline: '',
        description: '',
        primaryText: '',
        callToAction: 'shop_now',
        destinationUrl: '',
        language: 'english',
        imageUrl: '',
        videoUrl: '',
        platforms: ['facebook', 'instagram'],
        usageType: 'ad',
        prompt: '',
        referenceImages: [] as string[] // For AI - multiple reference images
    });

    // AI Generated preview
    const [generatedImage, setGeneratedImage] = useState<string>('');
    const [generatedContent, setGeneratedContent] = useState<{ headline: string, description: string } | null>(null);

    useEffect(() => {
        fetchCreatives();
    }, []);

    const fetchCreatives = async () => {
        try {
            const res = await fetch(`${API_URL}/creatives`);
            const data = await res.json();
            setCreatives(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch creatives:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File, isReference: boolean = false) => {
        if (!file) return;

        setUploading(true);
        try {
            const formDataUpload = new FormData();

            // Check if it's a video based on file type or form type
            const isVideo = file.type.startsWith('video/') || formData.type === 'video';

            if (isVideo) {
                formDataUpload.append('video', file);
            } else {
                formDataUpload.append('image', file);
            }

            const endpoint = isVideo ? `${API_URL}/upload/video` : `${API_URL}/upload/image`;

            const res = await fetch(endpoint, {
                method: 'POST',
                body: formDataUpload
            });

            if (res.ok) {
                const data = await res.json();
                const fullUrl = `${API_URL.replace('/api', '')}${data.url}`;

                if (isReference) {
                    setFormData(prev => ({ ...prev, referenceImages: [...prev.referenceImages, fullUrl] }));
                } else if (isVideo) {
                    setFormData(prev => ({ ...prev, videoUrl: fullUrl }));
                } else {
                    setFormData(prev => ({ ...prev, imageUrl: fullUrl }));
                }
            } else {
                const errorData = await res.json();
                console.error('Upload failed:', errorData.error);
                alert('Upload failed: ' + (errorData.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleCreateManual = async () => {
        try {
            setGenerating(true);
            const res = await fetch(`${API_URL}/creatives`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name || `Creative ${new Date().toLocaleDateString()}`,
                    creativeType: formData.type,
                    content: {
                        headline: formData.headline,
                        description: formData.description,
                        primaryText: formData.primaryText,
                        callToAction: formData.callToAction,
                        language: formData.language
                    },
                    media: {
                        imageUrl: formData.type === 'image' ? formData.imageUrl : '',
                        videoUrl: formData.type === 'video' ? formData.videoUrl : ''
                    },
                    usage: {
                        usageType: formData.usageType,
                        platforms: formData.platforms
                    },
                    status: 'draft'
                })
            });
            if (res.ok) {
                fetchCreatives();
                setShowCreateModal(false);
                resetForm();
            }
        } catch (error) {
            console.error('Failed to create creative:', error);
        } finally {
            setGenerating(false);
        }
    };

    const handleGenerateAI = async () => {
        if (!formData.prompt) return;
        try {
            setGenerating(true);
            const res = await fetch(`${API_URL}/creatives/generate-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: formData.prompt,
                    type: formData.type,
                    language: formData.language,
                    platforms: formData.platforms,
                    referenceImages: formData.referenceImages,
                    previewOnly: true // Just generate preview, don't save yet
                })
            });
            if (res.ok) {
                const data = await res.json();
                // Set generated preview
                setGeneratedImage(data.generatedImageUrl || 'https://via.placeholder.com/512x512?text=AI+Generated');
                setGeneratedContent({
                    headline: data.content?.headline || 'AI Generated Headline',
                    description: data.content?.description || 'AI generated description for your ad'
                });
            }
        } catch (error) {
            console.error('Failed to generate AI creative:', error);
        } finally {
            setGenerating(false);
        }
    };

    // Save AI generated creative after preview
    const handleSaveAICreative = async () => {
        try {
            setGenerating(true);
            const res = await fetch(`${API_URL}/creatives`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name || `AI Creative - ${new Date().toLocaleDateString()}`,
                    creativeType: formData.type,
                    content: {
                        headline: generatedContent?.headline || '',
                        description: generatedContent?.description || '',
                        primaryText: formData.prompt,
                        callToAction: formData.callToAction,
                        language: formData.language
                    },
                    media: {
                        imageUrl: generatedImage
                    },
                    usage: {
                        usageType: formData.usageType,
                        platforms: formData.platforms
                    },
                    aiGenerated: {
                        isAiGenerated: true,
                        prompt: formData.prompt
                    },
                    status: 'draft'
                })
            });
            if (res.ok) {
                fetchCreatives();
                setShowCreateModal(false);
                resetForm();
                setGeneratedImage('');
                setGeneratedContent(null);
            }
        } catch (error) {
            console.error('Failed to save AI creative:', error);
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this creative?')) return;
        try {
            await fetch(`${API_URL}/creatives/${id}`, { method: 'DELETE' });
            fetchCreatives();
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'paused' ? 'live' : 'paused';
        try {
            await fetch(`${API_URL}/creatives/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchCreatives();
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };

    const handleEdit = (creative: Creative) => {
        setEditingCreative(creative);
        setCreateMode('manual');
        setFormData({
            name: creative.name,
            type: creative.creativeType || 'image',
            headline: creative.content?.headline || '',
            description: creative.content?.description || '',
            primaryText: creative.content?.primaryText || '',
            callToAction: creative.content?.callToAction || 'shop_now',
            language: creative.content?.language || 'english',
            imageUrl: creative.media?.imageUrl || '',
            platforms: creative.usage?.platforms || ['facebook', 'instagram'],
            usageType: creative.usage?.usageType || 'ad',
            prompt: '',
            referenceImages: []
        });
        setShowCreateModal(true);
    };

    const handleUpdate = async () => {
        if (!editingCreative) return;
        try {
            setGenerating(true);
            const res = await fetch(`${API_URL}/creatives/${editingCreative._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    creativeType: formData.type,
                    content: {
                        headline: formData.headline,
                        description: formData.description,
                        primaryText: formData.primaryText,
                        callToAction: formData.callToAction,
                        language: formData.language
                    },
                    media: {
                        imageUrl: formData.imageUrl
                    },
                    usage: {
                        usageType: formData.usageType,
                        platforms: formData.platforms
                    }
                })
            });
            if (res.ok) {
                fetchCreatives();
                setShowCreateModal(false);
                setEditingCreative(null);
                resetForm();
            }
        } catch (error) {
            console.error('Failed to update:', error);
        } finally {
            setGenerating(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'image',
            headline: '',
            description: '',
            primaryText: '',
            callToAction: 'shop_now',
            destinationUrl: '',
            language: 'english',
            imageUrl: '',
            videoUrl: '',
            platforms: ['facebook', 'instagram'],
            usageType: 'ad',
            prompt: '',
            referenceImages: []
        });
        setGeneratedImage('');
        setGeneratedContent(null);
    };

    const filteredCreatives = creatives.filter(c => {
        if (activeTab === 'ai') return c.aiGenerated?.isAiGenerated;
        if (activeTab === 'manual') return !c.aiGenerated?.isAiGenerated;
        return true;
    });

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'bg-slate-100 text-slate-600',
            pending: 'bg-yellow-100 text-yellow-600',
            approved: 'bg-blue-100 text-blue-600',
            live: 'bg-emerald-100 text-emerald-600',
            paused: 'bg-orange-100 text-orange-600'
        };
        return colors[status] || 'bg-slate-100 text-slate-600';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="text-purple-500" />
                        Creative Studio
                    </h1>
                    <p className="text-slate-500">Create ads manually or generate with AI</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => { setCreateMode('manual'); setShowCreateModal(true); }}
                        variant="outline"
                    >
                        <Plus size={16} className="mr-2" />
                        Manual Create
                    </Button>
                    <Button
                        onClick={() => { setCreateMode('ai'); setShowCreateModal(true); }}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                        <Wand2 size={16} className="mr-2" />
                        AI Generate
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Total Creatives</p>
                                <p className="text-2xl font-bold">{creatives.length}</p>
                            </div>
                            <Layout className="w-8 h-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">AI Generated</p>
                                <p className="text-2xl font-bold">{creatives.filter(c => c.aiGenerated?.isAiGenerated).length}</p>
                            </div>
                            <Sparkles className="w-8 h-8 text-pink-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Live Ads</p>
                                <p className="text-2xl font-bold">{creatives.filter(c => c.status === 'live').length}</p>
                            </div>
                            <Globe className="w-8 h-8 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Drafts</p>
                                <p className="text-2xl font-bold">{creatives.filter(c => c.status === 'draft').length}</p>
                            </div>
                            <Edit2 className="w-8 h-8 text-slate-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b pb-4">
                {['all', 'manual', 'ai'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${activeTab === tab
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        {tab === 'ai' ? 'AI Generated' : tab}
                    </button>
                ))}
            </div>

            {/* Creatives Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
            ) : filteredCreatives.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p className="text-slate-500">No creatives yet</p>
                        <p className="text-sm text-slate-400">Create your first ad creative</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCreatives.map((creative) => (
                        <Card key={creative._id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                            {/* Preview - Image or Video */}
                            <div className="relative h-48 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center overflow-hidden">
                                {creative.media?.videoUrl ? (
                                    /* Video Preview */
                                    <>
                                        <video
                                            src={creative.media.videoUrl}
                                            className="w-full h-full object-cover"
                                            muted
                                            onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                                            onMouseOut={(e) => {
                                                const video = e.target as HTMLVideoElement;
                                                video.pause();
                                                video.currentTime = 0;
                                            }}
                                        />
                                        {/* Video Play Icon Overlay */}
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity">
                                            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-slate-900 border-b-8 border-b-transparent ml-1"
                                                    style={{ borderLeftWidth: '14px' }}
                                                />
                                            </div>
                                        </div>
                                        {/* Video Badge */}
                                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                            <Video size={12} /> VIDEO
                                        </div>
                                    </>
                                ) : creative.media?.imageUrl ? (
                                    /* Image Preview */
                                    <>
                                        <img
                                            src={creative.media.imageUrl}
                                            alt={creative.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {/* Image Badge */}
                                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                            <Image size={12} /> IMAGE
                                        </div>
                                    </>
                                ) : (
                                    /* No Media Placeholder */
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-2">
                                            <Image className="w-8 h-8 text-slate-500" />
                                        </div>
                                        <p className="text-slate-500 text-sm">No preview</p>
                                    </div>
                                )}

                                {/* AI Generated Sparkle */}
                                {creative.aiGenerated?.isAiGenerated && (
                                    <div className="absolute top-2 left-2">
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg">
                                            <Sparkles size={10} /> AI
                                        </div>
                                    </div>
                                )}
                            </div>

                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-semibold truncate">{creative.name}</h3>
                                        <p className="text-xs text-slate-500">{creative.creativeType}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Badge className={getStatusColor(creative.status)}>
                                            {creative.status}
                                        </Badge>
                                        {creative.aiGenerated?.isAiGenerated && (
                                            <Badge className="bg-purple-100 text-purple-600">
                                                <Sparkles size={10} className="mr-1" /> AI
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {creative.content?.headline && (
                                    <p className="text-sm text-slate-700 mb-2 line-clamp-2">
                                        {creative.content.headline}
                                    </p>
                                )}

                                <div className="flex items-center gap-2 mt-3">
                                    <span className="text-xs text-slate-400 ml-auto">
                                        {new Date(creative.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="flex gap-1 mt-3 pt-3 border-t">
                                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => setViewingCreative(creative)}>
                                        <Eye size={14} className="mr-1" /> View
                                    </Button>
                                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleEdit(creative)}>
                                        <Edit2 size={14} className="mr-1" /> Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleToggleStatus(creative._id, creative.status)}
                                        className={creative.status === 'paused' ? 'text-emerald-500 hover:text-emerald-700' : 'text-orange-500 hover:text-orange-700'}
                                        title={creative.status === 'paused' ? 'Activate' : 'Pause'}
                                    >
                                        {creative.status === 'paused' ? (
                                            <span className="text-xs">Active</span>
                                        ) : (
                                            <span className="text-xs">Pause</span>
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(creative._id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {editingCreative ? (
                                    <>
                                        <Edit2 className="text-blue-500" />
                                        Edit Creative
                                    </>
                                ) : createMode === 'ai' ? (
                                    <>
                                        <Wand2 className="text-purple-500" />
                                        AI Generate Creative
                                    </>
                                ) : (
                                    <>
                                        <Plus className="text-emerald-500" />
                                        Create Manual Creative
                                    </>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {createMode === 'ai' ? (
                                /* AI Mode */
                                <>
                                    <div>
                                        <label className="text-sm font-medium">Your Prompt</label>
                                        <textarea
                                            value={formData.prompt}
                                            onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                                            placeholder="Describe the ad you want to create... e.g., 'Create an exciting Eid sale ad for fashion products targeting young women in Karachi'"
                                            className="w-full mt-1 p-3 border rounded-lg h-28 resize-none"
                                        />
                                    </div>

                                    {/* Reference Images - Multiple smaller inline */}
                                    <div>
                                        <label className="text-sm font-medium">Attach Reference Images (Optional)</label>
                                        <input
                                            type="file"
                                            ref={refImageInputRef}
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload(file, true);
                                            }}
                                        />
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            {formData.referenceImages.map((imgUrl, index) => (
                                                <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0">
                                                    <img src={imgUrl} alt={`Ref ${index + 1}`} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => setFormData({
                                                            ...formData,
                                                            referenceImages: formData.referenceImages.filter((_, i) => i !== index)
                                                        })}
                                                        className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => refImageInputRef.current?.click()}
                                                disabled={uploading}
                                                className="w-16 h-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-0.5 hover:bg-purple-50 hover:border-purple-300 transition-colors flex-shrink-0"
                                            >
                                                {uploading ? (
                                                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                                                ) : (
                                                    <>
                                                        <ImagePlus className="w-4 h-4 text-purple-400" />
                                                        <span className="text-[9px] text-slate-400">Add</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            Upload images as reference material for AI generation
                                        </p>
                                    </div>

                                    {/* Generate Button */}
                                    <Button
                                        onClick={handleGenerateAI}
                                        disabled={generating || !formData.prompt}
                                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                    >
                                        {generating ? (
                                            <>
                                                <Loader2 size={16} className="mr-2 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 size={16} className="mr-2" />
                                                Generate AI Creative
                                            </>
                                        )}
                                    </Button>

                                    {/* Generated Output Preview */}
                                    {generatedImage && (
                                        <div className="border-2 border-purple-200 rounded-xl p-4 bg-purple-50/30">
                                            <h4 className="text-sm font-semibold text-purple-700 mb-3 flex items-center gap-2">
                                                <Sparkles size={16} />
                                                Generated Output
                                            </h4>
                                            <div className="relative">
                                                <img
                                                    src={generatedImage}
                                                    alt="AI Generated"
                                                    className="w-full h-64 object-cover rounded-lg border shadow-sm"
                                                />
                                                <div className="absolute top-2 right-2">
                                                    <Badge className="bg-purple-500 text-white">AI Generated</Badge>
                                                </div>
                                            </div>
                                            {generatedContent && (
                                                <div className="mt-3 space-y-2">
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">Headline</p>
                                                        <p className="text-sm font-semibold">{generatedContent.headline}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">Description</p>
                                                        <p className="text-sm text-slate-600">{generatedContent.description}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Save Generated Creative Button */}
                                            <Button
                                                onClick={handleSaveAICreative}
                                                disabled={generating}
                                                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
                                            >
                                                {generating ? (
                                                    <>
                                                        <Loader2 size={16} className="mr-2 animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus size={16} className="mr-2" />
                                                        Save Creative
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full mt-1 p-2 border rounded-lg bg-white"
                                            >
                                                <option value="image">Image Ad</option>
                                                <option value="video">Video Ad</option>
                                                <option value="carousel">Carousel</option>
                                                <option value="story">Story</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Language</label>
                                            <select
                                                value={formData.language}
                                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                                className="w-full mt-1 p-2 border rounded-lg bg-white"
                                            >
                                                <option value="english">English</option>
                                                <option value="urdu">Urdu</option>
                                                <option value="roman_urdu">Roman Urdu</option>
                                                <option value="mixed">Mixed</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* Manual Mode */
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Creative name"
                                                className="w-full mt-1 p-2 border rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value, imageUrl: '', videoUrl: '' })}
                                                className="w-full mt-1 p-2 border rounded-lg bg-white"
                                            >
                                                <option value="image">Image</option>
                                                <option value="video">Video</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Headline</label>
                                        <input
                                            type="text"
                                            value={formData.headline}
                                            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                                            placeholder="Ad headline"
                                            className="w-full mt-1 p-2 border rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Ad description"
                                            className="w-full mt-1 p-2 border rounded-lg h-20 resize-none"
                                        />
                                    </div>
                                    {/* Dynamic Upload Section based on Type */}
                                    <div>
                                        <label className="text-sm font-medium">
                                            {formData.type === 'video' ? 'Video' : 'Image'}
                                        </label>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept={formData.type === 'video' ? 'video/*' : 'image/*'}
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload(file, false);
                                            }}
                                        />

                                        {formData.type === 'image' ? (
                                            /* Image Upload */
                                            <>
                                                {formData.imageUrl ? (
                                                    <div className="relative w-full h-40 rounded-lg overflow-hidden border mt-1">
                                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={uploading}
                                                        className="w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-emerald-50 hover:border-emerald-300 transition-colors mt-1"
                                                    >
                                                        {uploading ? (
                                                            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Image className="w-8 h-8 text-emerald-400" />
                                                                <span className="text-sm text-slate-500">Click to upload image</span>
                                                                <span className="text-xs text-slate-400">JPG, PNG, WebP (Max 5MB)</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                                <div className="mt-2">
                                                    <input
                                                        type="text"
                                                        value={formData.imageUrl}
                                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                                        placeholder="Or paste image URL..."
                                                        className="w-full p-2 border rounded-lg text-sm"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            /* Video Upload */
                                            <>
                                                {formData.videoUrl ? (
                                                    <div className="relative w-full h-40 rounded-lg overflow-hidden border mt-1 bg-slate-900">
                                                        <video src={formData.videoUrl} className="w-full h-full object-contain" controls />
                                                        <button
                                                            onClick={() => setFormData({ ...formData, videoUrl: '' })}
                                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={uploading}
                                                        className="w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-purple-50 hover:border-purple-300 transition-colors mt-1"
                                                    >
                                                        {uploading ? (
                                                            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Video className="w-8 h-8 text-purple-400" />
                                                                <span className="text-sm text-slate-500">Click to upload video</span>
                                                                <span className="text-xs text-slate-400">MP4, MOV, WebM (Max 100MB)</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                                <div className="mt-2">
                                                    <input
                                                        type="text"
                                                        value={formData.videoUrl}
                                                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                                        placeholder="Or paste video URL..."
                                                        className="w-full p-2 border rounded-lg text-sm"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Call to Action</label>
                                            <select
                                                value={formData.callToAction}
                                                onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
                                                className="w-full mt-1 p-2 border rounded-lg bg-white"
                                            >
                                                <option value="shop_now">Shop Now</option>
                                                <option value="learn_more">Learn More</option>
                                                <option value="order_now">Order Now</option>
                                                <option value="get_offer">Get Offer</option>
                                                <option value="contact_us">Contact Us</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Language</label>
                                            <select
                                                value={formData.language}
                                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                                className="w-full mt-1 p-2 border rounded-lg bg-white"
                                            >
                                                <option value="english">English</option>
                                                <option value="urdu">Urdu</option>
                                                <option value="roman_urdu">Roman Urdu</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Destination URL */}
                                    <div>
                                        <label className="text-sm font-medium">
                                            Destination URL <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.destinationUrl}
                                            onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                                            placeholder="https://yourwebsite.com/landing-page"
                                            className="w-full mt-1 p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
                                        />
                                        <p className="text-xs text-slate-400 mt-1">
                                            Where users will go when they click your ad
                                        </p>
                                    </div>
                                </>
                            )
                            }

                            {/* Usage Type */}
                            <div>
                                <label className="text-sm font-medium">Use As</label>
                                <div className="flex gap-4 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={formData.usageType === 'ad'}
                                            onChange={() => setFormData({ ...formData, usageType: 'ad' })}
                                        />
                                        <span className="text-sm">Ad</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={formData.usageType === 'post'}
                                            onChange={() => setFormData({ ...formData, usageType: 'post' })}
                                        />
                                        <span className="text-sm">Post</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={formData.usageType === 'both'}
                                            onChange={() => setFormData({ ...formData, usageType: 'both' })}
                                        />
                                        <span className="text-sm">Both</span>
                                    </label>
                                </div>
                            </div>

                            {/* Action Buttons - Hide for AI mode (has inline buttons) */}
                            {(createMode === 'manual' || editingCreative) && (
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => { setShowCreateModal(false); setEditingCreative(null); resetForm(); }}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={editingCreative ? handleUpdate : handleCreateManual}
                                        disabled={generating}
                                        className={`flex-1 ${editingCreative ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600'}`}
                                    >
                                        {generating ? (
                                            <Loader2 size={16} className="mr-2 animate-spin" />
                                        ) : editingCreative ? (
                                            <Edit2 size={16} className="mr-2" />
                                        ) : (
                                            <Plus size={16} className="mr-2" />
                                        )}
                                        {generating ? 'Saving...' : editingCreative ? 'Save Changes' : 'Create'}
                                    </Button>
                                </div>
                            )}

                            {/* Cancel button for AI mode */}
                            {createMode === 'ai' && !editingCreative && (
                                <div className="pt-4 border-t">
                                    <Button
                                        variant="outline"
                                        onClick={() => { setShowCreateModal(false); resetForm(); }}
                                        className="w-full"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </CardContent >
                    </Card >
                </div >
            )}

            {/* View Creative Modal */}
            {viewingCreative && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white shadow-2xl">
                        {/* Header */}
                        <div className="relative">
                            {/* Creative Preview */}
                            <div className="h-64 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                                {viewingCreative.media?.imageUrl ? (
                                    <img
                                        src={viewingCreative.media.imageUrl}
                                        alt={viewingCreative.name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : viewingCreative.media?.videoUrl ? (
                                    <video
                                        src={viewingCreative.media.videoUrl}
                                        controls
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <Image className="w-16 h-16 text-slate-600 mx-auto mb-2" />
                                        <p className="text-slate-500">No media</p>
                                    </div>
                                )}
                            </div>

                            {/* Close button */}
                            <button
                                onClick={() => setViewingCreative(null)}
                                className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                            >
                                <X size={18} />
                            </button>

                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex gap-2">
                                <Badge className={`${viewingCreative.status === 'live' ? 'bg-emerald-500' : viewingCreative.status === 'draft' ? 'bg-slate-500' : 'bg-orange-500'} text-white`}>
                                    {viewingCreative.status}
                                </Badge>
                                {viewingCreative.aiGenerated?.isAiGenerated && (
                                    <Badge className="bg-purple-500 text-white">
                                        <Sparkles size={10} className="mr-1" /> AI Generated
                                    </Badge>
                                )}
                                <Badge className="bg-blue-500 text-white">
                                    {viewingCreative.creativeType || 'image'}
                                </Badge>
                            </div>
                        </div>

                        {/* Content */}
                        <CardContent className="p-6">
                            {/* Title & Actions */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">{viewingCreative.name}</h2>
                                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                        <Clock size={14} />
                                        Created on {new Date(viewingCreative.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Share2 size={14} className="mr-1" /> Share
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Download size={14} className="mr-1" /> Download
                                    </Button>
                                </div>
                            </div>

                            {/* Creative Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    {viewingCreative.content?.headline && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Headline</label>
                                            <p className="text-lg font-semibold text-slate-900 mt-1">{viewingCreative.content.headline}</p>
                                        </div>
                                    )}
                                    {viewingCreative.content?.description && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Description</label>
                                            <p className="text-slate-700 mt-1">{viewingCreative.content.description}</p>
                                        </div>
                                    )}
                                    {viewingCreative.content?.primaryText && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Primary Text</label>
                                            <p className="text-slate-700 mt-1">{viewingCreative.content.primaryText}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <label className="text-xs font-medium text-slate-500">Call to Action</label>
                                            <p className="font-semibold text-slate-900 capitalize mt-1">
                                                {(viewingCreative.content?.callToAction || 'shop_now').replace('_', ' ')}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3">
                                            <label className="text-xs font-medium text-slate-500">Language</label>
                                            <p className="font-semibold text-slate-900 capitalize mt-1">
                                                {viewingCreative.content?.language || 'English'}
                                            </p>
                                        </div>
                                    </div>

                                    {viewingCreative.usage?.platforms && viewingCreative.usage.platforms.length > 0 && (
                                        <div>
                                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Platforms</label>
                                            <div className="flex gap-2 mt-2">
                                                {viewingCreative.usage.platforms.map(platform => (
                                                    <Badge key={platform} variant="outline" className="capitalize">
                                                        {platform === 'facebook' && <Facebook size={12} className="mr-1" />}
                                                        {platform === 'instagram' && <Instagram size={12} className="mr-1" />}
                                                        {platform}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {viewingCreative.aiGenerated?.isAiGenerated && viewingCreative.aiGenerated?.prompt && (
                                        <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                                            <label className="text-xs font-medium text-purple-600 uppercase tracking-wide flex items-center gap-1">
                                                <Sparkles size={12} /> AI Prompt
                                            </label>
                                            <p className="text-sm text-purple-800 mt-1 italic">"{viewingCreative.aiGenerated.prompt}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-6 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        handleEdit(viewingCreative);
                                        setViewingCreative(null);
                                    }}
                                >
                                    <Edit2 size={16} className="mr-2" /> Edit Creative
                                </Button>
                                <Button
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                                    onClick={() => {
                                        // Navigate to publish with this creative
                                        window.location.href = '/publish';
                                    }}
                                >
                                    <Send size={16} className="mr-2" /> Use in Campaign
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div >
    );
}

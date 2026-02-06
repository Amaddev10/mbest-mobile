/**
 * TutorResourcesScreen - MBEST Mobile App
 * Manage and share educational resources with students
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal as RNModal,
  Alert,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { pick, types } from '@react-native-documents/picker';
import { tutorService, type Resource, type ResourceRequest } from '../../services/api/tutor';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../constants/colors';
import { spacing, borderRadius, shadows } from '../../constants/spacing';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Header } from '../../components/common/Header';
import { Icon } from '../../components/common/Icon';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import type { TutorStackParamList } from '../../types/navigation';

type NavigationPropType = NavigationProp<TutorStackParamList>;
type TabType = 'all' | 'uploads' | 'requests';

interface SummaryCardProps {
  label: string;
  value: string | number;
  color?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, color = colors.primary }) => (
  <Card style={styles.summaryCard}>
    <Text style={styles.summaryValue}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </Card>
);

export const TutorResourcesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationPropType>();
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  
  // State
  const [selectedTab, setSelectedTab] = useState<TabType>('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showClassFilter, setShowClassFilter] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ResourceRequest | null>(null);

  // Fetch data
  const { data: resourcesData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['tutorResources', searchQuery, typeFilter, classFilter],
    queryFn: () => tutorService.getResources({ 
      search: searchQuery,
      type: typeFilter !== 'all' ? typeFilter : undefined,
      class_id: classFilter !== 'all' ? parseInt(classFilter) : undefined,
    }),
    enabled: !!token,
  });

  const { data: requestsData, refetch: refetchRequests } = useQuery({
    queryKey: ['tutorResourceRequests'],
    queryFn: () => tutorService.getResourceRequests(),
    enabled: !!token && selectedTab === 'requests',
  });

  const { data: classesData } = useQuery({
    queryKey: ['tutorClasses'],
    queryFn: () => tutorService.getClasses(),
    enabled: !!token,
  });

  const resourcesRaw = (resourcesData as any)?.data?.data || (resourcesData as any)?.data || [];
  const resources: Resource[] = Array.isArray(resourcesRaw) ? resourcesRaw : [];
  
  const requestsRaw = (requestsData as any)?.data?.data || (requestsData as any)?.data || [];
  const requests: ResourceRequest[] = Array.isArray(requestsRaw) ? requestsRaw : [];
  
  const classesRaw = (classesData as any)?.data?.data || (classesData as any)?.data || [];
  const classes = Array.isArray(classesRaw) ? classesRaw : [];

  // Calculate stats from resources data
  const stats = useMemo(() => {
    const totalFromApi = (resourcesData as any)?.data?.total || resources.length;
    const publicCount = resources.filter(r => r.is_public).length;
    const privateCount = resources.filter(r => !r.is_public).length;
    const totalDownloads = resources.reduce((sum, r) => {
      const downloads = typeof r.downloads === 'string' ? parseInt(r.downloads) : r.downloads;
      return sum + (downloads || 0);
    }, 0);
    
    return {
      total: totalFromApi,
      public: publicCount,
      private: privateCount,
      total_downloads: totalDownloads,
    };
  }, [resources, resourcesData]);

  const myUploads = resources.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 10);

  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

  const handleApproveRequest = (request: ResourceRequest) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const handleRejectRequest = (request: ResourceRequest) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const handleFulfillRequest = (request: ResourceRequest) => {
    setSelectedRequest(request);
    setShowFulfillModal(true);
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (resourceId: number) => tutorService.deleteResource(resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutorResources'] });
      Alert.alert('Success', 'Resource deleted successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete resource');
    },
  });

  const handleDeleteResource = (resourceId: number, resourceTitle: string) => {
    Alert.alert(
      'Delete Resource',
      `Are you sure you want to delete "${resourceTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteMutation.mutate(resourceId)
        },
      ]
    );
  };

  const handleDownloadResource = async (resourceId: number, resourceTitle: string) => {
    try {
      const ReactNativeBlobUtil = require('react-native-blob-util').default;
      const { PermissionsAndroid, Platform } = require('react-native');
      
      // Request notification permission for Android 13+
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          'android.permission.POST_NOTIFICATIONS' as any
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Required', 'Notification permission is needed to show download progress.');
        }
      }
      
      const downloadUrl = `https://engine-rebuild.co.uk/mbest/public/api/v1/resources/${resourceId}/download?token=${token}`;
      const timestamp = Date.now();
      const fileName = `${resourceTitle.replace(/[^a-z0-9 ]/gi, '_')}_${timestamp}.pdf`;
      
      const { config, fs, android } = ReactNativeBlobUtil;
      const downloads = fs.dirs.DownloadDir;
      const filePath = `${downloads}/${fileName}`;
      
      config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: filePath,
          description: 'Downloading resource',
          title: resourceTitle,
          mime: 'application/pdf',
          mediaScannable: true,
        },
      })
      .fetch('GET', downloadUrl, {
        Authorization: `Bearer ${token}`,
      })
      .progress((received, total) => {
        const percentage = Math.floor((received / total) * 100);
        console.log('Download progress:', percentage + '%');
      })
      .then((res: any) => {
        const downloadedPath = res.path();
        console.log('Downloaded to:', downloadedPath);
        
        // Show success with open file option
        Alert.alert(
          'Download Complete!',
          `${resourceTitle}\n\nSaved in Downloads folder`,
          [
            {
              text: 'OK',
              style: 'cancel'
            },
            {
              text: 'Open File',
              onPress: () => {
                android.actionViewIntent(downloadedPath, 'application/pdf');
              }
            }
          ]
        );
      })
      .catch((error: any) => {
        console.error('Download error:', error);
        Alert.alert(
          'Download Failed', 
          'Could not download file. Please try again.'
        );
      });
      
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to start download.');
    }
  };

  const getResourceIcon = (type: string): 'file-text' | 'video' | 'link' | 'file' => {
    switch (type.toLowerCase()) {
      case 'pdf': return 'file-text';
      case 'video': return 'video';
      case 'link': return 'link';
      default: return 'file';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return colors.info;
      case 'video': return colors.error;
      case 'link': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const formatFileSize = (size?: string) => {
    if (!size) return '';
    
    // If already formatted (contains 'MB', 'KB', 'GB'), return as is
    if (size.includes('MB') || size.includes('KB') || size.includes('GB')) {
      return size;
    }
    
    // Otherwise, assume it's in bytes and convert to MB
    const sizeNum = parseFloat(size);
    if (isNaN(sizeNum)) return size;
    
    const mb = sizeNum / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Resources" showBack />
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Resources"
        showBack
        rightAction={
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
            <Icon name="plus" size={16} color={colors.textInverse} />
            <Text style={styles.addButtonText}>Add Resource</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          setShowTypeFilter(false);
          setShowClassFilter(false);
        }}
      >
        <Text style={styles.subtitle}>
          Manage and share educational resources with your students
        </Text>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <SummaryCard label="Total Resources" value={stats.total} />
          <SummaryCard label="Public Resources" value={stats.public} color={colors.success} />
          <SummaryCard label="Private Resources" value={stats.private} color={colors.warning} />
          <SummaryCard label="Total Downloads" value={stats.total_downloads} color={colors.info} />
        </View>

        {/* Search and Filters - Above Tabs */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources..."
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={() => setSearchQuery(searchInput)}
            returnKeyType="search"
            placeholderTextColor={colors.textTertiary}
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchInput('');
              setSearchQuery('');
            }}>
              <Icon name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          <View style={styles.filterButtonContainer}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                setShowTypeFilter(!showTypeFilter);
                setShowClassFilter(false);
              }}
            >
              <Text style={styles.filterButtonText}>
                {typeFilter === 'all' ? 'All Types' : typeFilter}
              </Text>
              <Icon name="chevron-down" size={16} color={colors.text} />
            </TouchableOpacity>
            {showTypeFilter && (
              <View style={styles.filterDropdown}>
                {['all', 'Document', 'PDF', 'Video', 'External Link'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.filterDropdownItem}
                    onPress={() => {
                      setTypeFilter(type.toLowerCase());
                      setShowTypeFilter(false);
                    }}
                  >
                    <Text style={styles.filterDropdownText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <View style={styles.filterButtonContainer}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {
                setShowClassFilter(!showClassFilter);
                setShowTypeFilter(false);
              }}
            >
              <Text style={styles.filterButtonText}>
                {classFilter === 'all' ? 'All Classes' : classes.find(c => c.id.toString() === classFilter)?.name || 'All Classes'}
              </Text>
              <Icon name="chevron-down" size={16} color={colors.text} />
            </TouchableOpacity>
            {showClassFilter && (
              <View style={styles.filterDropdown}>
                <ScrollView style={styles.filterDropdownScroll} nestedScrollEnabled>
                  <TouchableOpacity
                    style={styles.filterDropdownItem}
                    onPress={() => {
                      setClassFilter('all');
                      setShowClassFilter(false);
                    }}
                  >
                    <Text style={styles.filterDropdownText}>All Classes</Text>
                  </TouchableOpacity>
                  {classes.map((cls) => (
                    <TouchableOpacity
                      key={cls.id}
                      style={styles.filterDropdownItem}
                      onPress={() => {
                        setClassFilter(cls.id.toString());
                        setShowClassFilter(false);
                      }}
                    >
                      <Text style={styles.filterDropdownText}>{cls.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
            onPress={() => setSelectedTab('all')}
          >
            <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
              All Resources
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'uploads' && styles.tabActive]}
            onPress={() => setSelectedTab('uploads')}
          >
            <Text style={[styles.tabText, selectedTab === 'uploads' && styles.tabTextActive]}>
              My Uploads
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'requests' && styles.tabActive]}
            onPress={() => setSelectedTab('requests')}
          >
            <View style={styles.tabWithBadge}>
              <Text style={[styles.tabText, selectedTab === 'requests' && styles.tabTextActive]}>
                Resource Requests
              </Text>
            </View>
          </TouchableOpacity>
        </View>


        {/* Content based on selected tab */}
        {selectedTab === 'all' && (
          <View style={styles.resourcesGrid}>
            {resources.map((resource) => (
              <Card key={resource.id} style={styles.resourceCard}>
                <View style={styles.resourceHeader}>
                  <View style={[styles.resourceTypeIcon, { backgroundColor: getTypeColor(resource.type) + '20' }]}>
                    <Icon name={getResourceIcon(resource.type)} size={20} color={getTypeColor(resource.type)} />
                  </View>
                  <View style={styles.resourceTypeBadge}>
                    <Text style={[styles.resourceTypeText, { color: getTypeColor(resource.type) }]}>
                      {resource.type}
                    </Text>
                  </View>
                </View>
                <Text style={styles.resourceTitle} numberOfLines={2}>{resource.title}</Text>
                {resource.description && (
                  <Text style={styles.resourceDescription} numberOfLines={2}>
                    {resource.description}
                  </Text>
                )}
                <View style={styles.resourceMeta}>
                  {resource.category && (
                    <Text style={styles.resourceMetaText}>Category: {resource.category}</Text>
                  )}
                  {resource.file_size && (
                    <Text style={styles.resourceMetaText}>{formatFileSize(resource.file_size)}</Text>
                  )}
                </View>
                {resource.tags && (() => {
                  const tagsArray = Array.isArray(resource.tags) 
                    ? resource.tags 
                    : typeof resource.tags === 'string' 
                      ? (resource.tags as string).split(',').map((t: string) => t.trim())
                      : [];
                  return (
                    <View style={styles.tagsContainer}>
                      {tagsArray.slice(0, 3).map((tag: string, index: number) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  );
                })()}
                <View style={styles.resourceFooter}>
                  <Text style={styles.downloadsText}>
                    {resource.downloads || 0} downloads
                  </Text>
                  <TouchableOpacity 
                    style={styles.downloadButton}
                    onPress={() => handleDownloadResource(resource.id, resource.title)}
                  >
                    <Icon name="download" size={16} color={colors.textInverse} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {selectedTab === 'uploads' && (
          <View>
            <Text style={styles.sectionTitle}>Recently Uploaded</Text>
            <Text style={styles.sectionSubtitle}>Resources you've added recently</Text>
            {myUploads.map((resource) => (
              <Card key={resource.id} style={styles.uploadCard}>
                <View style={[styles.uploadIcon, { backgroundColor: getTypeColor(resource.type) + '20' }]}>
                  <Icon name={getResourceIcon(resource.type)} size={24} color={getTypeColor(resource.type)} />
                </View>
                <View style={styles.uploadContent}>
                  <Text style={styles.uploadTitle}>{resource.title}</Text>
                  <Text style={styles.uploadMeta}>
                    {new Date(resource.created_at).toLocaleDateString()} • {resource.downloads || 0} downloads
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteResource(resource.id, resource.title)}
                >
                  <Icon name="trash" size={18} color={colors.error} />
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}

        {selectedTab === 'requests' && (
          <View>
            <Text style={styles.sectionTitle}>Resource Requests</Text>
            {requests.map((request) => (
              <Card key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestTitle}>{request.title}</Text>
                  <View style={styles.requestBadges}>
                    {request.priority === 'high' && (
                      <View style={[styles.priorityBadge, styles.priorityHigh]}>
                        <Text style={styles.priorityText}>high</Text>
                      </View>
                    )}
                    <View style={[styles.statusBadge, request.status === 'pending' && styles.statusPending]}>
                      <Icon name="clock" size={12} color={colors.warning} />
                      <Text style={[styles.statusText, { color: colors.warning }]}>
                        {request.status}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.requestMeta}>
                  Requested by {request.student_name || 'Unknown'} • {new Date(request.requested_at).toLocaleDateString()}
                </Text>
                {request.category && (
                  <Text style={styles.requestDetail}>Category: {request.category}</Text>
                )}
                {request.type && (
                  <Text style={styles.requestDetail}>Type: {request.type}</Text>
                )}
                {request.description && (
                  <View style={styles.requestDescription}>
                    <Text style={styles.requestDescriptionLabel}>Description:</Text>
                    <Text style={styles.requestDescriptionText}>{request.description}</Text>
                  </View>
                )}
                {request.status === 'pending' && (
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[styles.requestActionButton, styles.approveButton]}
                      onPress={() => handleApproveRequest(request)}
                    >
                      <Icon name="check-circle" size={16} color={colors.textInverse} />
                      <Text style={styles.requestActionText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.requestActionButton, styles.rejectButton]}
                      onPress={() => handleRejectRequest(request)}
                    >
                      <Icon name="x" size={16} color={colors.text} />
                      <Text style={[styles.requestActionText, { color: colors.text }]}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.requestActionButton, styles.fulfillButton]}
                      onPress={() => handleFulfillRequest(request)}
                    >
                      <Icon name="check" size={16} color={colors.text} />
                      <Text style={[styles.requestActionText, { color: colors.text }]}>Mark as Fulfilled</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            ))}
            {requests.length === 0 && (
              <View style={styles.emptyContainer}>
                <Icon name="inbox" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyText}>No resource requests</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Resource Modal */}
      {showAddModal && (
        <AddResourceModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          classes={classes}
          onSuccess={() => {
            refetch();
            setShowAddModal(false);
          }}
        />
      )}

      {/* Approve Request Modal */}
      {showApproveModal && selectedRequest && (
        <ApproveRequestModal
          visible={showApproveModal}
          request={selectedRequest}
          onClose={() => {
            setShowApproveModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={() => {
            refetchRequests();
            setShowApproveModal(false);
            setSelectedRequest(null);
          }}
        />
      )}

      {/* Reject Request Modal */}
      {showRejectModal && selectedRequest && (
        <RejectRequestModal
          visible={showRejectModal}
          request={selectedRequest}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={() => {
            refetchRequests();
            setShowRejectModal(false);
            setSelectedRequest(null);
          }}
        />
      )}

      {/* Fulfill Request Modal */}
      {showFulfillModal && selectedRequest && (
        <FulfillRequestModal
          visible={showFulfillModal}
          request={selectedRequest}
          onClose={() => {
            setShowFulfillModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={() => {
            refetchRequests();
            setShowFulfillModal(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </View>
  );
};

// Add Resource Modal Component
interface AddResourceModalProps {
  visible: boolean;
  onClose: () => void;
  classes: any[];
  onSuccess: () => void;
}

const AddResourceModal: React.FC<AddResourceModalProps> = ({ visible, onClose, classes, onSuccess }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('document');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [classId, setClassId] = useState('');
  const [tags, setTags] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => tutorService.createResource(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutorResources'] });
      queryClient.invalidateQueries({ queryKey: ['tutorResourceStats'] });
      Alert.alert('Success', 'Resource added successfully');
      onSuccess();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to add resource');
    },
  });

  const handlePickFile = async () => {
    try {
      // Use DocumentPicker to allow all file types (images, PDFs, docs, etc.)
      const result = await pick({
        type: [
          types.images,      // jpg, png, gif, etc.
          types.pdf,         // PDF files
          types.doc,         // DOC files
          types.docx,        // DOCX files
          types.plainText,   // TXT files
          types.allFiles,    // All other files
        ],
        allowMultiSelection: false,
      });

      if (result && result.length > 0) {
        const file = result[0];
        
        const maxSize = 104857600; // 100MB
        if (file.size && file.size > maxSize) {
          Alert.alert('Error', 'File size must be less than 100MB');
          return;
        }
        
        setSelectedFile({
          uri: file.uri || '',
          type: file.type || 'application/octet-stream',
          name: file.name || 'file',
          size: file.size,
        });
        setFileUrl('');
      }
    } catch (err: any) {
      // Check if user cancelled the picker
      if (err?.code === 'DOCUMENT_PICKER_CANCELED' || err?.message?.includes('cancel')) {
        // User cancelled the picker - do nothing
        return;
      }
      
      // Only show error for actual errors, not cancellation
      if (err?.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Failed to pick file');
        console.error('DocumentPicker Error:', err);
      }
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    // Check if user provided either file or URL (URL only required for external links)
    if (type === 'link') {
      if (!fileUrl.trim()) {
        Alert.alert('Error', 'Please enter a resource URL for external links');
        return;
      }
    } else {
      if (!selectedFile && !fileUrl.trim()) {
        Alert.alert('Error', 'Please select a file or enter a file URL');
        return;
      }
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);
    formData.append('description', description);
    formData.append('category', category);
    if (classId) formData.append('class_id', classId);
    formData.append('tags', tags);
    formData.append('is_public', isPublic ? '1' : '0');
    
    // Prioritize file upload over URL
    if (selectedFile) {
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.type,
        name: selectedFile.name,
      } as any);
    } else if (fileUrl.trim()) {
      formData.append('file_url', fileUrl);
    }

    createMutation.mutate(formData);
  };

  return (
    <RNModal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderLeft}>
            <Text style={styles.modalTitle}>Add New Resource</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="x" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
          <Input
            label="Resource Title *"
            placeholder="E.g., React Hooks Cheat Sheet"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.inputLabel}>Resource Type *</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowTypeDropdown(!showTypeDropdown)}
          >
            <Text style={styles.dropdownText}>{type || 'Select type'}</Text>
            <Icon name="chevron-down" size={20} color={colors.text} />
          </TouchableOpacity>
          {showTypeDropdown && (
            <View style={styles.dropdownList}>
              {['Document', 'PDF', 'Video', 'External Link'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.dropdownListItem, type === t.toLowerCase() && styles.dropdownListItemSelected]}
                  onPress={() => {
                    setType(t.toLowerCase());
                    setShowTypeDropdown(false);
                  }}
                >
                  {type === t.toLowerCase() && <Icon name="check" size={16} color={colors.success} />}
                  <Text style={[styles.dropdownListItemText, type === t.toLowerCase() && styles.dropdownListItemTextSelected]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Brief description of the resource"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={colors.textTertiary}
          />

          <View style={styles.rowInputs}>
            <View style={styles.halfInput}>
              <Input
                label="Category"
                placeholder="e.g., Reference, Tutorial"
                value={category}
                onChangeText={setCategory}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Class (Optional)</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowClassDropdown(!showClassDropdown)}
              >
                <Text style={[styles.dropdownText, !classId && styles.dropdownPlaceholder]}>
                  {classId ? classes.find(c => c.id.toString() === classId)?.name : 'Select class'}
                </Text>
                <Icon name="chevron-down" size={20} color={colors.text} />
              </TouchableOpacity>
              {showClassDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView style={styles.dropdownListScroll} nestedScrollEnabled>
                    <TouchableOpacity
                      style={styles.dropdownListItem}
                      onPress={() => {
                        setClassId('');
                        setShowClassDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownListItemText}>No specific class</Text>
                    </TouchableOpacity>
                    {classes.map((cls) => (
                      <TouchableOpacity
                        key={cls.id}
                        style={[styles.dropdownListItem, classId === cls.id.toString() && styles.dropdownListItemSelected]}
                        onPress={() => {
                          setClassId(cls.id.toString());
                          setShowClassDropdown(false);
                        }}
                      >
                        {classId === cls.id.toString() && <Icon name="check" size={16} color={colors.success} />}
                        <Text style={[styles.dropdownListItemText, classId === cls.id.toString() && styles.dropdownListItemTextSelected]}>
                          {cls.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          <Input
            label="Tags (comma-separated)"
            placeholder="e.g., react, hooks, javascript"
            value={tags}
            onChangeText={setTags}
          />

          {type === 'link' ? (
            <>
              <Input
                label="Resource URL *"
                placeholder="https://example.com"
                value={fileUrl}
                onChangeText={setFileUrl}
              />
              <Text style={styles.helperText}>
                Enter the external link to the resource
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.inputLabel}>File Upload *</Text>
              <View style={styles.fileUploadContainer}>
                <TouchableOpacity style={styles.fileUploadBox} onPress={handlePickFile}>
                  <Icon name="upload" size={32} color={colors.textSecondary} />
                  <Text style={styles.fileUploadText}>Tap to select image from gallery</Text>
                  <Text style={[styles.fileUploadText, { fontSize: 11, marginTop: 4 }]}>
                    For PDFs/Documents, use URL input below
                  </Text>
                </TouchableOpacity>
                <View style={styles.fileInputRow}>
                  <Text style={styles.fileInputLabel}>Selected:</Text>
                  <Text style={styles.fileInputValue} numberOfLines={1}>
                    {selectedFile ? selectedFile.name : 'No file chosen'}
                  </Text>
                  {selectedFile && (
                    <TouchableOpacity onPress={() => setSelectedFile(null)}>
                      <Icon name="x" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <Text style={styles.helperText}>
                For PDFs/Documents: Upload to Google Drive/Dropbox and paste link here
              </Text>
              <Input
                placeholder="https://drive.google.com/file/... or https://example.com/file.pdf"
                value={fileUrl}
                onChangeText={(text) => {
                  setFileUrl(text);
                  if (text.trim()) setSelectedFile(null);
                }}
                editable={!selectedFile}
              />
            </>
          )}

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setIsPublic(!isPublic)}
          >
            <View style={[styles.checkbox, isPublic && styles.checkboxChecked]}>
              {isPublic && <Icon name="check" size={16} color={colors.textInverse} />}
            </View>
            <Text style={styles.checkboxLabel}>
              Make this resource publicly accessible to all students
            </Text>
          </TouchableOpacity>

          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title={createMutation.isPending ? 'Adding...' : 'Add Resource'}
              onPress={handleSubmit}
              variant="primary"
              style={styles.modalButton}
              loading={createMutation.isPending}
            />
          </View>
        </ScrollView>
      </View>
    </RNModal>
  );
};

// Approve Request Modal Component
interface ApproveRequestModalProps {
  visible: boolean;
  request: ResourceRequest;
  onClose: () => void;
  onSuccess: () => void;
}

const ApproveRequestModal: React.FC<ApproveRequestModalProps> = ({ visible, request, onClose, onSuccess }) => {
  const [notes, setNotes] = useState('');

  const approveMutation = useMutation({
    mutationFn: () => tutorService.approveResourceRequest(request.id, notes),
    onSuccess: () => {
      Alert.alert('Success', 'Request approved successfully');
      onSuccess();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to approve request');
    },
  });

  return (
    <RNModal visible={visible} animationType="fade" transparent>
      <View style={styles.approveModalOverlay}>
        <View style={styles.approveModal}>
          <View style={styles.approveModalHeader}>
            <Text style={styles.approveModalTitle}>Approve Resource Request</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.approveModalSubtitle}>Review request: {request.title}</Text>
          
          <View style={styles.textAreaContainer}>
            <Text style={styles.inputLabel}>Review Notes (Optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Add any notes about this decision..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.approveModalActions}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title={approveMutation.isPending ? 'Approving...' : 'Approve'}
              onPress={() => approveMutation.mutate()}
              variant="primary"
              style={styles.modalButton}
              loading={approveMutation.isPending}
            />
          </View>
        </View>
      </View>
    </RNModal>
  );
};

// Reject Request Modal Component
interface RejectRequestModalProps {
  visible: boolean;
  request: ResourceRequest;
  onClose: () => void;
  onSuccess: () => void;
}

const RejectRequestModal: React.FC<RejectRequestModalProps> = ({ visible, request, onClose, onSuccess }) => {
  const [notes, setNotes] = useState('');

  const rejectMutation = useMutation({
    mutationFn: () => tutorService.rejectResourceRequest(request.id, notes),
    onSuccess: () => {
      Alert.alert('Success', 'Request rejected');
      onSuccess();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reject request');
    },
  });

  return (
    <RNModal visible={visible} animationType="fade" transparent>
      <View style={styles.approveModalOverlay}>
        <View style={styles.approveModal}>
          <View style={styles.approveModalHeader}>
            <Text style={styles.approveModalTitle}>Reject Resource Request</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.approveModalSubtitle}>Review request: {request.title}</Text>
          
          <View style={styles.textAreaContainer}>
            <Text style={styles.inputLabel}>Review Notes (Optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Add any notes about this decision..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.approveModalActions}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title={rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
              onPress={() => rejectMutation.mutate()}
              variant="primary"
              style={styles.modalButton}
              loading={rejectMutation.isPending}
            />
          </View>
        </View>
      </View>
    </RNModal>
  );
};

// Fulfill Request Modal Component
interface FulfillRequestModalProps {
  visible: boolean;
  request: ResourceRequest;
  onClose: () => void;
  onSuccess: () => void;
}

const FulfillRequestModal: React.FC<FulfillRequestModalProps> = ({ visible, request, onClose, onSuccess }) => {
  const fulfillMutation = useMutation({
    mutationFn: () => tutorService.fulfillResourceRequest(request.id),
    onSuccess: () => {
      Alert.alert('Success', 'Request marked as fulfilled');
      onSuccess();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to fulfill request');
    },
  });

  return (
    <RNModal visible={visible} animationType="fade" transparent>
      <View style={styles.approveModalOverlay}>
        <View style={styles.approveModal}>
          <View style={styles.approveModalHeader}>
            <Text style={styles.approveModalTitle}>Mark as Fulfilled</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.approveModalSubtitle}>
            Mark this resource request as fulfilled: {request.title}
          </Text>
          <Text style={styles.fulfillDescription}>
            This will notify the student that their request has been completed.
          </Text>

          <View style={styles.approveModalActions}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title={fulfillMutation.isPending ? 'Marking...' : 'Mark as Fulfilled'}
              onPress={() => fulfillMutation.mutate()}
              variant="primary"
              style={styles.modalButton}
              loading={fulfillMutation.isPending}
            />
          </View>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    includeFontPadding: false,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textInverse,
    includeFontPadding: false,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: spacing.sm,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    includeFontPadding: false,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    includeFontPadding: false,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabActive: {
    backgroundColor: colors.primary,
    marginBottom: spacing.xs,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    includeFontPadding: false,
  },
  tabTextActive: {
    color: colors.textInverse
    
  },
  tabWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  badge: {
    backgroundColor: colors.error,
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textInverse,
    includeFontPadding: false,
  },
  filtersSection: {
    marginBottom: spacing.lg,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  filterButtonContainer: {
    flex: 1,
    position: 'relative',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    minHeight: 48,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.text,
    includeFontPadding: false,
  },
  filterDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
    ...shadows.md,
    zIndex: 1000,
    elevation: 5,
    maxHeight: 200,
  },
  filterDropdownScroll: {
    maxHeight: 200,
  },
  filterDropdownItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterDropdownText: {
    fontSize: 14,
    color: colors.text,
    includeFontPadding: false,
  },
  resourcesGrid: {
    gap: spacing.md,
  },
  resourceCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  resourceTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceTypeBadge: {
    flex: 1,
  },
  resourceTypeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'lowercase',
    includeFontPadding: false,
  },
  moreButton: {
    padding: spacing.xs,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    includeFontPadding: false,
  },
  resourceDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
    includeFontPadding: false,
  },
  resourceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  resourceMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
    includeFontPadding: false,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: 11,
    color: colors.primary,
    includeFontPadding: false,
  },
  resourceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  downloadsText: {
    fontSize: 12,
    color: colors.textSecondary,
    includeFontPadding: false,
  },
  downloadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
  },
  downloadButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textInverse,
    includeFontPadding: false,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    includeFontPadding: false,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    includeFontPadding: false,
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadContent: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    includeFontPadding: false,
  },
  uploadMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    includeFontPadding: false,
  },
  uploadTypeBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  uploadTypeText: {
    fontSize: 11,
    fontWeight: '600',
    includeFontPadding: false,
  },
  deleteButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.error + '10',
  },
  requestCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  requestTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.md,
    includeFontPadding: false,
  },
  requestBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  priorityHigh: {
    backgroundColor: colors.error + '20',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.error,
    includeFontPadding: false,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusPending: {
    backgroundColor: colors.warning + '20',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    includeFontPadding: false,
  },
  requestMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    includeFontPadding: false,
  },
  requestDetail: {
    fontSize: 13,
    color: colors.text,
    marginBottom: spacing.xs,
    includeFontPadding: false,
  },
  requestDescription: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  requestDescriptionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    includeFontPadding: false,
  },
  requestDescriptionText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    includeFontPadding: false,
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  requestActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  approveButton: {
    backgroundColor: colors.primary,
  },
  rejectButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fulfillButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requestActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textInverse,
    includeFontPadding: false,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.md,
    includeFontPadding: false,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalHeaderLeft: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    includeFontPadding: false,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    includeFontPadding: false,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    includeFontPadding: false,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    minHeight: 48,
  },
  dropdownText: {
    fontSize: 14,
    color: colors.text,
    includeFontPadding: false,
  },
  dropdownPlaceholder: {
    color: colors.textTertiary,
  },
  dropdownList: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: -spacing.md,
    marginBottom: spacing.md,
    maxHeight: 200,
    ...shadows.md,
    elevation: 5,
  },
  dropdownListScroll: {
    maxHeight: 200,
  },
  dropdownListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownListItemSelected: {
    backgroundColor: colors.primary + '10',
  },
  dropdownListItemText: {
    fontSize: 14,
    color: colors.text,
    includeFontPadding: false,
  },
  dropdownListItemTextSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  textAreaContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    includeFontPadding: false,
  },
  fileUploadContainer: {
    marginBottom: spacing.md,
  },
  fileUploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    marginBottom: spacing.sm,
    minHeight: 120,
  },
  fileUploadText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    includeFontPadding: false,
  },
  fileInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 48,
  },
  fileInputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    includeFontPadding: false,
  },
  fileInputValue: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
    includeFontPadding: false,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    includeFontPadding: false,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
  // Approve Modal
  approveModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  approveModal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: 450,
    ...shadows.xl,
  },
  approveModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  approveModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    includeFontPadding: false,
  },
  approveModalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    padding: spacing.md,
    paddingTop: spacing.sm,
    includeFontPadding: false,
  },
  approveModalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    paddingTop: spacing.xs,
  },
  fulfillDescription: {
    
    fontSize: 14,
    color: colors.textSecondary,
    padding: spacing.lg,
    paddingTop: 0,
    includeFontPadding: false,
  },
});

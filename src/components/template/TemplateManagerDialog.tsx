'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit2, Minus } from 'lucide-react';
import type { TemplateItem } from '@/types';

interface TemplateManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditingCategory {
  id: string | null;
  name: string;
}

interface EditingTemplate {
  id: string | null;
  categoryId: string;
  name: string;
  points: string;
  operationType: 'add' | 'deduct';
}

export function TemplateManagerDialog({ open, onOpenChange }: TemplateManagerDialogProps) {
  const [editingCategory, setEditingCategory] = useState<EditingCategory>({ id: null, name: '' });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EditingTemplate>({
    id: null,
    categoryId: '',
    name: '',
    points: '10',
    operationType: 'add'
  });
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);

  const categories = useAppStore((state) => state.categories);
  const templates = useAppStore((state) => state.templates);
  const addCategory = useAppStore((state) => state.addCategory);
  const updateCategory = useAppStore((state) => state.updateCategory);
  const deleteCategory = useAppStore((state) => state.deleteCategory);
  const addTemplate = useAppStore((state) => state.addTemplate);
  const updateTemplate = useAppStore((state) => state.updateTemplate);
  const deleteTemplate = useAppStore((state) => state.deleteTemplate);

  // 分类操作
  const handleAddCategory = () => {
    if (editingCategory.name.trim()) {
      addCategory(editingCategory.name.trim());
      setEditingCategory({ id: null, name: '' });
      setIsAddingCategory(false);
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory.id && editingCategory.name.trim()) {
      updateCategory(editingCategory.id, editingCategory.name.trim());
      setEditingCategory({ id: null, name: '' });
    }
  };

  const handleEditCategory = (id: string, name: string) => {
    setEditingCategory({ id, name });
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('删除分类将同时删除该分类下的所有模板，确定要删除吗？')) {
      deleteCategory(id);
    }
  };

  const startAddingCategory = () => {
    setEditingCategory({ id: null, name: '' });
    setIsAddingCategory(true);
  };

  const cancelCategoryEdit = () => {
    setEditingCategory({ id: null, name: '' });
    setIsAddingCategory(false);
  };

  // 模板操作
  const handleAddTemplate = () => {
    if (editingTemplate.categoryId && editingTemplate.name.trim() && editingTemplate.points) {
      addTemplate(
        editingTemplate.categoryId,
        editingTemplate.name.trim(),
        parseInt(editingTemplate.points, 10),
        editingTemplate.operationType
      );
      setEditingTemplate({
        id: null,
        categoryId: editingTemplate.categoryId,
        name: '',
        points: '10',
        operationType: 'add'
      });
      setIsAddingTemplate(false);
    }
  };

  const handleUpdateTemplate = () => {
    if (
      editingTemplate.id &&
      editingTemplate.categoryId &&
      editingTemplate.name.trim() &&
      editingTemplate.points
    ) {
      updateTemplate(
        editingTemplate.id,
        editingTemplate.name.trim(),
        parseInt(editingTemplate.points, 10),
        editingTemplate.operationType
      );
      setEditingTemplate({
        id: null,
        categoryId: '',
        name: '',
        points: '10',
        operationType: 'add'
      });
    }
  };

  const handleEditTemplate = (template: TemplateItem) => {
    setEditingTemplate({
      id: template.id,
      categoryId: template.categoryId,
      name: template.name,
      points: template.points.toString(),
      operationType: template.operationType
    });
    setIsAddingTemplate(false);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('确定要删除此模板吗？')) {
      deleteTemplate(id);
    }
  };

  const startAddingTemplate = (categoryId: string) => {
    setEditingTemplate({
      id: null,
      categoryId,
      name: '',
      points: '10',
      operationType: 'add'
    });
    setIsAddingTemplate(true);
  };

  const cancelTemplateEdit = () => {
    setEditingTemplate({
      id: null,
      categoryId: '',
      name: '',
      points: '10',
      operationType: 'add'
    });
    setIsAddingTemplate(false);
  };

  // 对话框关闭时重置状态
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEditingCategory({ id: null, name: '' });
      setIsAddingCategory(false);
      setEditingTemplate({
        id: null,
        categoryId: '',
        name: '',
        points: '10',
        operationType: 'add'
      });
      setIsAddingTemplate(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>管理模板</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="categories">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">分类管理</TabsTrigger>
            <TabsTrigger value="templates">项目管理</TabsTrigger>
          </TabsList>

          {/* 分类管理 */}
          <TabsContent value="categories" className="space-y-4">
            {isAddingCategory && (
              <div className="space-y-2 p-4 border rounded-md bg-muted/50">
                <Label htmlFor="new-category-name">分类名称</Label>
                <Input
                  id="new-category-name"
                  placeholder="例如：学习类、家务类"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddCategory} disabled={!editingCategory.name.trim()}>
                    确认
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelCategoryEdit}>
                    取消
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-2 p-2 border rounded-md">
                  {editingCategory.id === category.id ? (
                    <>
                      <Input
                        value={editingCategory.name}
                        onChange={(e) =>
                          setEditingCategory({ ...editingCategory, name: e.target.value })
                        }
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleUpdateCategory} disabled={!editingCategory.name.trim()}>
                        保存
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelCategoryEdit}>
                        取消
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1">{category.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditCategory(category.id, category.name)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>

            {!isAddingCategory && (
              <Button onClick={startAddingCategory} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                添加分类
              </Button>
            )}
          </TabsContent>

          {/* 模板管理 */}
          <TabsContent value="templates" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                点击右侧按钮添加新项目
              </p>
              {!isAddingTemplate && categories.length > 0 && (
                <Button size="sm" onClick={() => startAddingTemplate(categories[0].id)}>
                  <Plus className="mr-2 h-4 w-4" />
                  添加项目
                </Button>
              )}
            </div>

            {isAddingTemplate && (
              <div className="space-y-3 p-4 border rounded-md bg-muted/50">
                <div>
                  <Label htmlFor="template-category">所属分类</Label>
                  <select
                    id="template-category"
                    value={editingTemplate.categoryId}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, categoryId: e.target.value })
                    }
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">请选择分类</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="template-name">项目名称</Label>
                  <Input
                    id="template-name"
                    placeholder="例如：完成作业"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="template-points">分数</Label>
                  <Input
                    id="template-points"
                    type="number"
                    value={editingTemplate.points}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, points: e.target.value })}
                  />
                </div>
                <div>
                  <Label>操作类型</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={editingTemplate.operationType === 'add' ? 'default' : 'outline'}
                      onClick={() => setEditingTemplate({ ...editingTemplate, operationType: 'add' })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      加分
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={editingTemplate.operationType === 'deduct' ? 'destructive' : 'outline'}
                      onClick={() => setEditingTemplate({ ...editingTemplate, operationType: 'deduct' })}
                    >
                      <Minus className="h-4 w-4 mr-1" />
                      扣分
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddTemplate}
                    disabled={!editingTemplate.categoryId || !editingTemplate.name.trim() || !editingTemplate.points}
                    className="flex-1"
                  >
                    确认
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelTemplateEdit} className="flex-1">
                    取消
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {categories.map((category) => {
                const categoryTemplates = templates.filter((t) => t.categoryId === category.id);
                return (
                  <div key={category.id} className="space-y-2">
                    <h3 className="font-medium text-sm text-muted-foreground">{category.name}</h3>
                    {categoryTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center gap-2 p-2 border rounded-md bg-muted/50"
                      >
                        {editingTemplate.id === template.id ? (
                          <>
                            <div className="flex-1 space-y-2">
                              <select
                                value={editingTemplate.categoryId}
                                onChange={(e) =>
                                  setEditingTemplate({ ...editingTemplate, categoryId: e.target.value })
                                }
                                className="w-full p-2 border rounded-md text-sm"
                              >
                                {categories.map((cat) => (
                                  <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </option>
                                ))}
                              </select>
                              <Input
                                value={editingTemplate.name}
                                onChange={(e) =>
                                  setEditingTemplate({ ...editingTemplate, name: e.target.value })
                                }
                              />
                              <Input
                                type="number"
                                value={editingTemplate.points}
                                onChange={(e) =>
                                  setEditingTemplate({ ...editingTemplate, points: e.target.value })
                                }
                              />
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={editingTemplate.operationType === 'add' ? 'default' : 'outline'}
                                  onClick={() =>
                                    setEditingTemplate({ ...editingTemplate, operationType: 'add' })
                                  }
                                  className="flex-1"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  加分
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={
                                    editingTemplate.operationType === 'deduct' ? 'destructive' : 'outline'
                                  }
                                  onClick={() =>
                                    setEditingTemplate({ ...editingTemplate, operationType: 'deduct' })
                                  }
                                  className="flex-1"
                                >
                                  <Minus className="h-4 w-4 mr-1" />
                                  扣分
                                </Button>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={handleUpdateTemplate}
                                disabled={!editingTemplate.name.trim()}
                              >
                                保存
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelTemplateEdit}>
                                取消
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="flex-1">{template.name}</span>
                            <span
                              className={`text-sm ${
                                template.operationType === 'deduct'
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-green-600 dark:text-green-400'
                              }`}
                            >
                              {template.operationType === 'deduct' ? '-' : '+'}
                              {template.points}分
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

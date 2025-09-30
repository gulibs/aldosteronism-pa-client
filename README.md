# 环境配置

```bash
conda create -n skl024 python=3.8 -y
conda activate skl024
```

```bash
conda install -c conda-forge pandas numpy=1.20.3 scikit-learn=0.24.1 -y
```

```bash
python -m nuitka \
  --onefile \
  --follow-imports \
  --enable-plugin=numpy \
  --include-package=sklearn \
  --include-package=pandas \
  --include-package-data=sklearn \
  --include-package-data=pandas \
  --remove-output \
  --include-data-file=model/RF_binary_v1.pickle=model/RF_binary_v1.pickle \
  model/run.py
```

```
// render={({ field }) => (
  //   <FormItem>
  //     <FormLabel>使用高血压药物种类</FormLabel>
  //     <FormControl>
  //       <div className="space-y-2">
  //         <div
  //           className="border border-input rounded-md px-3 py-2 text-sm flex items-center flex-wrap gap-2 min-h-10 focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:border-ring"
  //         >
  //           {field.value?.map((tag: string, index: number) => (
  //             <div
  //               key={index}
  //               className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-sm flex items-center gap-1"
  //             >
  //               {tag}
  //               <button
  //                 type="button"
  //                 onClick={() => field.onChange(field.value?.filter((_, i) => i !== index))}
  //                 className="text-secondary-foreground hover:text-foreground"
  //               >
  //                 ×
  //               </button>
  //             </div>
  //           ))}
  //           <input
  //             type="text"
  //             onKeyDown={(e) => {
  //               if (e.key === 'Enter') {
  //                 e.preventDefault()
  //                 const value = e.currentTarget.value.trim()
  //                 if (value && !field.value?.includes(value)) {
  //                   field.onChange([...(field.value || []), value])
  //                 }
  //                 e.currentTarget.value = ''
  //               }
  //             }}
  //             placeholder="添加药物..."
  //             className="flex-1 min-w-20 bg-transparent outline-none"
  //           />
  //         </div>
  //         <p className="text-sm text-muted-foreground">
  //           按 Enter 添加药物
  //         </p>
  //       </div>
  //     </FormControl>
  //     <FormDescription>
  //       请输入患者使用的不同抗高血压药物类别。
  //     </FormDescription>
  //     <FormMessage />
  //   </FormItem>
  // )}
```

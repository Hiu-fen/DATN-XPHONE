// Đã tích hợp Form và Input từ Ant Design, giữ nguyên logic react-hook-form
import { Controller, useForm } from "react-hook-form";
import { Promotion } from "../../../interface/promotion";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { message, Form, Input, Button, Typography, Select, InputNumber, Tooltip } from "antd";
import { addPromotion, getAllCategory, getRandomCode } from "../../../api/admin/promotionApi";
import { useState } from "react";
import { ICategory } from "../../../interface/category";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { ArrowLeftOutlined } from "@ant-design/icons";

const PostAddPromotion = () => {
  const {
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    getValues,
    control,
    trigger
  } = useForm<Promotion>({ 
    mode: 'onChange',
    defaultValues: {
      quantity: 0,
      status: true
    }
 });

  const [code, setCode] = useState<string>("");
  const discountType = watch("discountType");
  const nav = useNavigate();

  const discountTypeOptions = [
    { value: "free_ship", label: "Miễn phí ship" },
    { value: "percent", label: "Giảm phần trăm" },
    { value: "fixed", label: "Giảm giá cố định" },
  ];

  const mutation = useMutation({
    mutationFn: async (data: Promotion) => {
      try {
        const { data: promotion } = await addPromotion(data);
        return promotion;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    onSuccess: () => {
      message.success("Thêm khuyến mãi thành công");
      nav("/admin/promotion/list");
    },
    onError: () => {
      message.error("Thêm khuyến mãi thất bại");
    },
  });

  const onSubmit = (data: Promotion) => {
    let discountValueToSend: number | undefined = undefined;
    if (data.discountType === "percent" || data.discountType === "fixed") {
      discountValueToSend = data.discountValue;
    }

    mutation.mutate({
      ...data,
      code,
      discountValue: discountValueToSend,
    });
  };

  const handleGenerateCode = async () => {
    try {
      const res = await getRandomCode();
      setCode(res.data.code);
      setValue("code", res.data.code, { shouldValidate: true });
      trigger("code");
    } catch (error) {
      message.error("Không thể tạo mã khuyến mãi");
    }
  };

  const { data: categories } = useQuery({
    queryKey: ["category"],
    queryFn: getAllCategory,
  });

  const categoryOptions = categories?.data.map((cat: ICategory) => ({
    label: cat.name,
    value: cat._id,
  })) || [];

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-center mb-4">Thêm khuyến mãi</h2>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className="bg-white shadow rounded border-2 p-6">
        <Form.Item
          label="Tên khuyến mãi"
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            rules={{
              required: "Tên khuyến mãi không được để trống",
              minLength: {
                value: 5,
                message: "Tên khuyến mãi phải có ít nhất 5 ký tự",
              },
            }}
            render={({ field }) => <Input {...field} />}
          />
        </Form.Item>

        <Form.Item label="Mã khuyến mãi" validateStatus={errors.code ? 'error' : ''} help={errors.code?.message}>
          <div className="flex gap-2">
            <Controller
              name="code"
              control={control}
              rules={{ required: "Mã không được để trống" }}
              render={({ field }) => (
                <Input
                  {...field}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    field.onChange(e.target.value);
                    trigger("code");
                  }}
                />
              )}
            />
            <Button onClick={handleGenerateCode}>Tạo mã</Button>
          </div>
        </Form.Item>

        <Form.Item label="Loại giảm giá" validateStatus={errors.discountType ? 'error' : ''} help={errors.discountType?.message}>
          <Controller
            name="discountType"
            control={control}
            rules={{ required: "Vui lòng chọn loại giảm giá" }}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  trigger("discountType");
                }}
                options={discountTypeOptions}
                placeholder="-- Chọn loại --"
                allowClear
              >
                {discountTypeOptions.map((opt) => (
                  <Select.Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Option>
                ))}
              </Select>
            )}
          />
        </Form.Item>

        {discountType === "percent" && (
          <>
            <Form.Item
              label="Phần trăm giảm"
              validateStatus={errors.discountValue ? 'error' : ''}
              help={errors.discountValue?.message}
            >
              <Controller
                name="discountValue"
                control={control}
                rules={{
                  required: "Vui lòng nhập % giảm",
                  min: { value: 1, message: "Tối thiểu 1%" },
                  max: { value: 100, message: "Tối đa 100%" },
                }}
                render={({ field }) => <Input type="number" {...field} />}
              />
            </Form.Item>

            <Form.Item
              label="Giảm tối đa (VNĐ)"
              validateStatus={errors.maxDiscount ? 'error' : ''}
              help={errors.maxDiscount?.message}
            >
              <Controller
                name="maxDiscount"
                control={control}
                rules={{
                  required: "Vui lòng nhập mức giảm tối đa",
                  min: { value: 1000, message: "Tối thiểu 1.000 VNĐ" },
                }}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    min={1000}
                    style={{ width: "100%" }}
                    placeholder="Ví dụ: 500000"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => Number(value?.replace(/,/g, "") || 0)}
                  />
                )}
              />
            </Form.Item>
          </>
        )}

        <Form.Item label="Danh mục sản phẩm áp dụng" validateStatus={errors.applicableCategories ? 'error' : ''} help={errors.applicableCategories?.message}>
          <Controller
            name="applicableCategories"
            control={control}
            rules={{ required: "Vui lòng chọn ít nhất 1 danh mục" }}
            render={({ field }) => (
              <Select
                mode="multiple"
                allowClear
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  trigger("applicableCategories");
                }}
                placeholder="-- Chọn danh mục --"
              >
                {categoryOptions.map((opt:any) => (
                  <Select.Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Option>
                ))}
              </Select>
            )}
          />
        </Form.Item>
        <Typography.Title level={4} className="mt-4 !mb-2">
          Điều kiện áp dụng
        </Typography.Title>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Áp dụng cho đơn hàng tối thiểu (VNĐ)"
            validateStatus={errors.condition?.minOrderValue ? 'error' : ''}
            help={errors.condition?.minOrderValue?.message}
          >
            <Controller
              name="condition.minOrderValue"
              control={control}
              rules={{
                required: "Vui lòng nhập giá trị tối thiểu",
                min: { value: 1000, message: "Giá trị tối thiểu phải từ 1.000 VNĐ" },
              }}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  placeholder="Ví dụ: 100000"
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => Number(value?.replace(/,/g, "") || 0)}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Áp dụng số lượng sản phẩm tối thiểu"
            validateStatus={errors.condition?.minQuantity ? 'error' : ''}
            help={errors.condition?.minQuantity?.message}
          >
            <Controller
              name="condition.minQuantity"
              control={control}
              rules={{
                required: "Vui lòng nhập số lượng tối thiểu",
                min: { value: 1, message: "Số lượng tối thiểu phải từ 1 sản phẩm" },
              }}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  placeholder="Ví dụ: 2"
                  style={{ width: "100%" }}
                />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item label="Số lượng khuyến mãi" validateStatus={errors.quantity ? 'error' : ''} help={errors.quantity?.message}>
          <Controller
            name="quantity"
            control={control}
            rules={{ required: "Không được để trống", min: { value: 1, message: "Phải lớn hơn 1" } }}
            render={({ field }) => <Input type="number" {...field} />}
          />
        </Form.Item>

        <Form.Item
          label="Giới hạn lượt dùng mỗi người"
          validateStatus={errors.maxUsagePerUser ? 'error' : ''}
          help={errors.maxUsagePerUser?.message}
        >
          <Controller
            name="maxUsagePerUser"
            control={control}
            rules={{
              required: "Không được để trống",
              min: { value: 1, message: "Phải lớn hơn 0" },
            }}
            render={({ field }) => <Input type="number" placeholder="Ví dụ: 1, 2, 3" {...field} />}
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Ngày bắt đầu" validateStatus={errors.startDate ? 'error' : ''} help={errors.startDate?.message}>
            <Controller
              name="startDate"
              control={control}
              rules={{ required: "Không được để trống" }}
              render={({ field }) => (
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm:ss"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(value) => {
                    field.onChange(value ? value.toISOString() : null);
                    trigger("startDate");
                  }}
                  className="w-full"
                />
              )}
            />
          </Form.Item>

          <Form.Item label="Ngày kết thúc" validateStatus={errors.endDate ? 'error' : ''} help={errors.endDate?.message}>
            <Controller
              name="endDate"
              control={control}
              rules={{
                required: "Không được để trống",
                validate: (value) => {
                  const start = getValues("startDate");
                  if (!value) return "Không được để trống";
                  if (!start) return true;
                  return dayjs(value).isSameOrAfter(dayjs(start)) || "Kết thúc phải sau bắt đầu";
                },
              }}
              render={({ field }) => (
                <DatePicker
                  showTime
                  format="DD/MM/YYYY HH:mm:ss"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(value) => {
                    field.onChange(value ? value.toISOString() : null);
                    trigger("endDate");
                  }}
                  className="w-full"
                />
              )}
            />
          </Form.Item>
        </div>

        <Form.Item label="Mô tả khuyến mãi" validateStatus={errors.description ? 'error' : ''} help={errors.description?.message}>
          <Controller
            name="description"
            control={control}
            rules={{ required: "Không được để trống mô tả" }}
            render={({ field }) => <Input.TextArea {...field} rows={4} />}
          />
        </Form.Item>

        {/* Trạng thái khuyến mãi */}
        <Form.Item
          label="Trạng thái"
          validateStatus={errors.status ? "error" : ""}
          help={errors.status?.message}
        >
          <Controller
            name="status"
            control={control}
            defaultValue={true}
            rules={{ required: "Vui lòng chọn trạng thái" }}
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Chọn trạng thái"
                onChange={(value) => field.onChange(value)}
                value={field.value}
                options={[
                  { label: "Hoạt động", value: true },
                  { label: "Hết hạn", value: false },
                ]}
              />
            )}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Thêm khuyến mãi
          </Button>
        </Form.Item>

        <div className="flex justify-end mt-2">
          <Tooltip title="Quay lại">
            <Button
              type="default"
              shape="circle"
              icon={<ArrowLeftOutlined />}
              onClick={() => nav(-1)}
            />
          </Tooltip>
        </div>
      </Form>
    </div>
  );
};

export default PostAddPromotion;
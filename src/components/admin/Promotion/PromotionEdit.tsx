// Đã tích hợp Form và Input từ Ant Design, giữ nguyên logic react-hook-form và sử dụng dayjs thay cho moment
import { Controller, useForm } from "react-hook-form";
import { Promotion } from "../../../interface/promotion";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DatePicker, Form, Input, Switch, Button, message, Typography, Select, InputNumber } from "antd";
import {
  getAllCategory,
  getPromotionById,
  getRandomCode,
  updatePromotion,
} from "../../../api/admin/promotionApi";
import { useEffect, useState } from "react";
import { ICategory } from "../../../interface/category";
import dayjs from "dayjs";

const PutEditPromotion = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
    getValues,
  } = useForm<Promotion>();

  const [code, setCode] = useState<string>("");
  const [categoryOptions, setCategoryOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const discountType = watch("discountType")

  const discountTypeOptions = [
    { value: "free_ship", label: "Miễn phí ship" },
    { value: "percent", label: "Khuyến mãi phần trăm" },
    { value: "fixed", label: "Khuyến mãi 200k" },
  ];

  const nav = useNavigate()
  const params = useParams()

  const { data: categories } = useQuery({
    queryKey: ["category"],
    queryFn: getAllCategory,
  });

  useEffect(() => {
    if (categories?.data) {
      const options = categories.data.map((cat: ICategory) => ({
        label: cat.name,
        value: cat._id,
      }));
      setCategoryOptions(options);
    }
  }, [categories]);

  useQuery({
    queryKey: ["promotions", params.id],
    queryFn: async () => {
      if (!params.id) return;
      const { data: promotion } = await getPromotionById(params.id);

      const formattedPromotion = {
        ...promotion,
        startDate: promotion.startDate || null,
        endDate: promotion.endDate || null,
        applicableCategories: promotion.applicableCategories?.map(
          (cat: ICategory) => cat._id
        ) || [],
      };

      reset(formattedPromotion);
      setCode(promotion.code);
      setValue("status", promotion.status);
      return promotion; 
    },
  });

  useEffect(() => {
    if (discountType !== "percent") {
      setValue("discountValue", undefined, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      setValue("maxDiscount", undefined, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [discountType, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: Promotion) => {
      const { data: promotion } = await updatePromotion(
        params.id as string,
        data
      );
      return promotion;
    },
    onSuccess: () => {
      message.success("Cập nhật khuyến mãi thành công");
      nav("/admin/promotion/list");
    },
    onError: () => {
      message.error("Cập nhật khuyến mãi thất bại");
    },
  });

  const onSubmit = (data: Promotion) => {
    mutation.mutate({
      ...data,
      code,
      applicableCategories: data.applicableCategories || [],
    });
  }

  const handleGenerateCode = async () => {
    try {
      const res = await getRandomCode();
      setCode(res.data.code);
      setValue("code", res.data.code, { shouldValidate: true });
    } catch (error) {
      message.error("Không thể tạo mã khuyến mãi");
    }
  };

  return (
    <div className="mx-auto mt-10 p-6 bg-white shadow rounded border-2">
      <Typography.Title
        level={2}
        className="!text-2xl !text-blue-600 !font-bold text-center mb-6"
      >
        Cập nhật khuyến mãi
      </Typography.Title>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item label="Tên khuyến mãi" validateStatus={errors.name ? 'error' : ''} help={errors.name?.message}>
          <Controller
            name="name"
            control={control}
            rules={{ 
              required: "Tên khuyến mãi không được để trống",
              minLength: { value: 5, message: "Tên phải ít nhất 5 ký tự" },
            }}
            render={({ field }) => <Input {...field} />}
          />
        </Form.Item>

        <Form.Item label="Mã khuyến mãi" validateStatus={errors.code ? 'error' : ''} help={errors.code?.message}>
          <div className="flex gap-2">
            <Controller
              name="code"
              control={control}
              rules={{ required: "Mã khuyến mãi không được để trống" }}
              render={({ field }) => (
                <Input
                  {...field}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    field.onChange(e.target.value);
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
                onChange={(value) => field.onChange(value)}
                placeholder="-- Chọn loại giảm giá --"
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

        <Form.Item
          label="Sản phẩm áp dụng"
          validateStatus={errors.applicableCategories ? 'error' : ''}
          help={errors.applicableCategories?.message}
        >
          <Controller
            name="applicableCategories"
            control={control}
            rules={{ required: "Vui lòng chọn ít nhất 1 danh mục" }}
            render={({ field }) => (
              <Select
                mode="multiple"
                allowClear
                placeholder="-- Chọn danh mục --"
                value={field.value}
                onChange={(value) => field.onChange(value)}
              >
                {categoryOptions.map((opt) => (
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
            rules={{ required: "Không được để trống", min: { value: 1, message: "Phải lớn hơn 0" } }}
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
                  onChange={(value) => field.onChange(value ? value.toISOString() : null)}
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
                  onChange={(value) => field.onChange(value ? value.toISOString() : null)}
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

        <Form.Item label="Trạng thái">
          <Controller
            name="status"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={field.onChange}
                checkedChildren="Hoạt động"
                unCheckedChildren="Không hoạt động"
              />
            )}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full bg-blue-600 hover:bg-blue-700">
            Cập nhật khuyến mãi
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default PutEditPromotion;
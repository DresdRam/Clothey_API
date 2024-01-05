import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderLine } from '../order_line/entity/order_line.entity';
import { OrderStatus } from '../order_status/entity/order_status.entity';
import { ShoppingCart } from '../shopping_cart/entity/shopping_cart.entity';
import { ShoppingCartItem } from '../shopping_cart_item/entity/shopping_cart_item.entity';
import { User } from '../user/entity/user.entity';
import { UserAddress } from '../user_address/entity/user_address.entity';
import { CancelOrderDto } from './dto/cancel_order.dto';
import { PlaceOrderDto } from './dto/place_order.dto';
import { UpdateOrderStatusDto } from './dto/update_status.dto';
import { ShopOrder } from './entity/shop_order.entity';
import { Governorate } from '../governorate/entity/governorate.entity';

@Injectable()
export class ShopOrderService {

    constructor(
        @InjectRepository(ShopOrder) private readonly orderRepo: Repository<ShopOrder>,
        @InjectRepository(OrderLine) private readonly orderLineRepo: Repository<OrderLine>,
        @InjectRepository(ShoppingCart) readonly cartRepo: Repository<ShoppingCart>,
        @InjectRepository(ShoppingCartItem) readonly itemsRepo: Repository<ShoppingCartItem>,
        @InjectRepository(User) readonly userRepo: Repository<User>,
        @InjectRepository(UserAddress) readonly addressRepo: Repository<UserAddress>
    ) { }

    async placeOrder(body: PlaceOrderDto, user_id: number) {

        this.setupUserAddress(body, user_id)
        const user = await this.getUser(user_id);
        const cart = await this.findCart(user_id);

        const insert_into_orders = await this.orderRepo.createQueryBuilder()
            .insert()
            .into(ShopOrder)
            .values([
                { user: user, payment: user.payments.at(0), address: user.addresses.at(0), order_total: 0 }
            ])
            .execute();

        const total_price = await this.placeToOrderLine(cart, insert_into_orders.raw.insertId);

        const update_total_price = await this.orderRepo.createQueryBuilder()
            .update()
            .set({ order_total: total_price })
            .where('id = :id', { id: insert_into_orders.raw.insertId })
            .execute();

        if (!update_total_price) {
            throw new HttpException("Could not complete order!", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        this.deleteCartItems(cart.id);

        return {
            statusCode: HttpStatus.CREATED,
            message: "Placed Order Successfuly."
        }

    }

    async setupUserAddress(body: PlaceOrderDto, user_id: number) {
        const address = await this.addressRepo.createQueryBuilder()
            .select()
            .where('user_id = :id', { id: user_id })
            .getOne();

        if (address) {
            const governorate = new Governorate();
            governorate.id = body.governorate_id;

            await this.addressRepo.createQueryBuilder()
                .update()
                .set(
                    {
                        governorate: governorate,
                        address_line1: body.address_line1,
                        address_line2: body.address_line2,
                        building_number: body.building_number
                    }
                )
                .where('id = :id', { id: address.id })
                .execute();
        } else {
            const user = new User();
            const governorate = new Governorate();
            governorate.id = body.governorate_id;
            user.id = user_id;

            await this.addressRepo.createQueryBuilder()
                .insert()
                .into(UserAddress)
                .values([
                    {
                        user: user,
                        governorate: governorate,
                        address_line1: body.address_line1,
                        address_line2: body.address_line2,
                        building_number: body.building_number
                    }
                ])
                .execute();
        }
    }

    async findOne(order_id: any) {
        const order = await this.orderRepo.createQueryBuilder('order')
            .select()
            .innerJoinAndSelect('order.address', 'address', 'order.shipping_address = address.id')
            .innerJoinAndSelect('order.order_lines', 'line', 'order.id = line.order_id')
            .innerJoinAndSelect('line.product', 'product', 'line.product_id = product.id')
            .innerJoinAndSelect('product.inventory', 'inventory', 'product.inventory_id = inventory.id')
            .innerJoinAndSelect('address.governorate', 'governorate', 'address.governorate_id = governorate.id')
            .innerJoinAndSelect('order.status', 'status', 'order.order_status = status.id')
            .where('order.id = :id', { id: order_id })
            .getOne()

        if (!order) {
            throw new HttpException("This user has no orders!", HttpStatus.NOT_FOUND)
        }

        return this.reformatOrderData(order);
    }

    private reformatOrderData(order: ShopOrder) {
        var final_json: any = {};
        var products = [];
        var order_total_price = 0;

        for (let x = 0; x < order.order_lines.length; x++) {
            const item = order.order_lines.at(x);
            const product: any = {};
            const total = item.product.inventory.price * item.quantity;
            product.id = item.product.id;
            product.name = item.product.name;
            product.main_image = item.product.main_image;
            product.price_per_piece = item.product.inventory.price;
            product.quantity = item.quantity;
            product.total = total;
            products.push(product);
            order_total_price += total;
        }

        final_json.products = products;
        final_json.shipping_price = 100;
        final_json.shipping_address = order.address.address_line1;
        final_json.shipping_governorate = order.address.governorate.governorate;
        final_json.order_total_price = order_total_price + 100;
        final_json.order_date = order.order_date;
        final_json.order_status = order.status.status;

        return final_json;
    }

    async myOrders(user_id: any) {
        const orders = await this.orderRepo.createQueryBuilder('order')
            .select([
                'order.id',
                'order.order_date',
                'order.order_total',
                'address.id',
                'address.address_line1',
                'address.address_line2',
                'address.building_number',
                'governorate.governorate'
            ])
            .innerJoin('order.address', 'address', 'order.shipping_address = address.id')
            .innerJoin('address.governorate', 'governorate', 'address.governorate_id = governorate.id')
            .innerJoin('order.status', 'status', 'order.order_status = status.id')
            .where('order.user_id = :id', { id: user_id })
            .getMany()

        if (!orders) {
            throw new HttpException("This user has no orders!", HttpStatus.NOT_FOUND)
        }

        return orders;
    }

    async preplacingOrder(user_id: number) {
        const cart = await this.cartRepo.createQueryBuilder('cart')
            .select([
                'cart.id',
                'item.id',
                'item.quantity',
                'product.id',
                'product.name',
                'product.main_image',
                'inventory.id',
                'inventory.qty_in_stock',
                'inventory.price'
            ])
            .innerJoin('cart.items', 'item', 'cart.id = item.cart_id')
            .innerJoin('item.product', 'product', 'product.id = item.product_id')
            .innerJoin('product.inventory', 'inventory', 'inventory.id = product.inventory_id')
            .where('cart.user_id = :id', { id: user_id })
            .getOne()

        if (!cart) {
            throw new HttpException("This user has no cart!", HttpStatus.NOT_FOUND);
        }

        if (cart.items.length == 0) {
            throw new HttpException("This user cart is empty!", HttpStatus.NOT_FOUND);
        }

        return this.reformatPreplaceOrderData(cart);
    }

    private reformatPreplaceOrderData(cart: ShoppingCart) {
        var final_json: any = {};
        var products = [];
        var order_total_price = 0;

        for (let x = 0; x < cart.items.length; x++) {
            const item = cart.items.at(x);
            const product: any = {};
            const total = item.product.inventory.price * item.quantity;
            product.id = item.product.id;
            product.name = item.product.name;
            product.main_image = item.product.main_image;
            product.price_per_piece = item.product.inventory.price;
            product.quantity = item.quantity;
            product.total = total;
            products.push(product);
            order_total_price += total;
        }

        final_json.products = products;
        final_json.shipping_price = 100;
        final_json.order_total_price = order_total_price + 100;

        return final_json;
    }

    async cancelOrder(body: CancelOrderDto) {
        const status = new OrderStatus();
        status.id = 4;

        const results = await this.orderRepo.createQueryBuilder()
            .update()
            .set({ status: status })
            .where('id = :id', { id: body.order_id })
            .execute()

        if (!results) {
            throw new HttpException("Could not update order status!", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Updated Order Status Successfuly."
        }
    }

    async updateOrderStatus(body: UpdateOrderStatusDto) {
        const status = new OrderStatus();
        status.id = body.status_id;

        const results = await this.orderRepo.createQueryBuilder()
            .update()
            .set({ status: status })
            .where('id = :id', { id: body.order_id })
            .execute()

        if (!results) {
            throw new HttpException("Could not update order status!", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Updated Order Status Successfuly."
        }
    }

    async findUserOrders(user_id: number) {
        const orders = await this.orderRepo.createQueryBuilder('order')
            .select([
                'order.id',
                'order.order_date',
                'order.order_total',
                'address.id',
                'address.address_line1',
                'address.address_line2',
                'address.building_number',
                'line.id',
                'line.quantity',
                'line.price',
                'product.id',
                'product.name',
                'product.main_image',
                'inventory.price',
                'inventory.qty_in_stock',
                'status.status',
            ])
            .innerJoin('order.address', 'address', 'order.shipping_address = address.id')
            .innerJoin('order.status', 'status', 'order.order_status = status.id')
            .innerJoin('order.order_lines', 'line', 'order.id = line.order_id')
            .innerJoin('line.product', 'product', 'line.product_id = product.id')
            .innerJoin('product.inventory', 'inventory', 'product.inventory_id = inventory.id')
            .where('order.user_id = :id', { id: user_id })
            .getMany()

        if (!orders) {
            throw new HttpException("The user has no orders!", HttpStatus.NOT_FOUND)
        }

        return orders;
    }

    private async findCart(user_id: number) {

        const cart = await this.cartRepo.createQueryBuilder('cart')
            .select([
                'cart.id',
                'item.id',
                'item.quantity',
                'product.id',
                'inventory.id',
                'inventory.price',
                'inventory.qty_in_stock',
            ])
            .innerJoinAndSelect('cart.items', 'item', 'item.cart_id = cart.id')
            .innerJoinAndSelect('item.product', 'product', 'item.product_id = product.id')
            .innerJoinAndSelect('product.inventory', 'inventory', 'product.inventory_id = inventory.id')
            .where('cart.user_id = :user_id', { user_id: user_id })
            .getOne();

        if (!cart) {
            throw new HttpException("The user has no cart!", HttpStatus.NOT_FOUND);
        }

        return cart;
    }

    private async deleteCartItems(cart_id: number) {
        const results = await this.itemsRepo.createQueryBuilder()
            .delete()
            .from(ShoppingCartItem)
            .where('cart_id = :cart_id', { cart_id: cart_id })
            .execute();

        if (!results) {
            throw new HttpException("Could not remove cart items!", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return results;
    }

    private async getUser(user_id: number) {

        const user = await this.userRepo.createQueryBuilder('user')
            .select([
                'user.id',
                'address.id',
                'payment.id'
            ])
            .leftJoinAndSelect('user.addresses', 'address', 'address.user_id = user.id')
            .leftJoinAndSelect('user.payments', 'payment', 'payment.user_id = user.id')
            .where('user.id = :user_id', { user_id: user_id })
            .getOne();

        if (!user) {
            throw new HttpException("The user does not exist!", HttpStatus.NOT_FOUND);
        }

        if (user.payments.length == 0) {
            throw new HttpException("The user has no payment!", HttpStatus.NOT_FOUND);
        }

        if (user.addresses.length == 0) {
            throw new HttpException("The user has no address!", HttpStatus.NOT_FOUND);
        }

        return user;
    }

    private calculateTotalPrice(item: ShoppingCartItem) {

        const price = item.product.inventory.price;
        const quantity = item.quantity;
        return price * quantity;
    }

    private async placeToOrderLine(cart: ShoppingCart, order_id: number) {

        var order_lines: OrderLine[] = [];
        var total = 0;

        for (let x = 0; x < cart.items.length; x++) {
            const item = cart.items.at(x);

            if (item.quantity > item.product.inventory.qty_in_stock) {
                throw new HttpException("The order quntity is more than our stock quantity!", HttpStatus.NOT_ACCEPTABLE);
            }

            const order = new ShopOrder();
            order.id = order_id;
            const order_line = new OrderLine();
            order_line.product = item.product;
            order_line.order = order;
            order_line.quantity = item.quantity;
            order_line.price = this.calculateTotalPrice(item);

            order_lines.push(order_line);
            total = total + this.calculateTotalPrice(item);
        }

        const insert_results = await this.orderLineRepo.createQueryBuilder()
            .insert()
            .into(OrderLine)
            .values(order_lines)
            .execute();

        if (!insert_results) {
            throw new HttpException("Could not complete order!", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return total;
    }

}
